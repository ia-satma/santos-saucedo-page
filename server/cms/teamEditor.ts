import { siteLink } from "@shared/siteControls";
import { z } from "zod";
import { eq, inArray, sql } from "drizzle-orm";
import { editorialDb } from "../db";
import {
  insertTeamMemberSchema,
  practiceGroups,
  teamMemberPracticeGroups,
  teamMembers,
  type TeamMember,
  type PracticeGroup,
} from "@shared/schema";
const text = z.string().max(10000);
const short = z.string().max(500);
const optional = short.optional();
const url = siteLink.or(z.literal(""));
export const teamEditorSchema = insertTeamMemberSchema.extend({
  name: short.trim().min(1),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: short.min(1),
  titleEs: short.min(1),
  role: short.min(1),
  roleEs: short.min(1),
  email: z.string().email().or(z.literal("")).nullable().optional(),
  phone: short.nullable().optional(),
  linkedinUrl: z
    .string()
    .url()
    .startsWith("https://")
    .or(z.literal(""))
    .nullable()
    .optional(),
  imageUrl: url.nullable().optional(),
  bio: text.nullable().optional(),
  bioEs: text.nullable().optional(),
  order: z.number().int().min(0).max(1000000).nullable().optional(),
  education: z
    .array(
      z.object({
        school: short,
        schoolEs: optional,
        degree: short,
        degreeEs: optional,
        year: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  barAdmissions: z
    .array(
      z.object({
        jurisdiction: short,
        jurisdictionEs: optional,
        year: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  languages: z.array(short).max(50).nullable().optional(),
  affiliations: z
    .array(
      z.object({
        organization: short,
        organizationEs: optional,
        role: optional,
        roleEs: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  rankings: z
    .array(
      z.object({
        publication: short,
        ranking: short,
        rankingEs: optional,
        year: optional,
        area: optional,
        areaEs: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  publications: z
    .array(
      z.object({
        title: short,
        titleEs: optional,
        journal: optional,
        year: optional,
        url: url.optional(),
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  experience: z
    .array(
      z.object({
        company: short,
        position: short,
        positionEs: optional,
        startYear: optional,
        endYear: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  representativeMatters: z
    .array(
      z.object({
        description: text,
        descriptionEs: text.optional(),
        client: optional,
        year: optional,
      }),
    )
    .max(100)
    .nullable()
    .optional(),
  practiceGroupIds: z.array(z.string().uuid()).max(100).optional(),
});
export function resolvedPracticeIds(
  group: PracticeGroup,
  people: TeamMember[],
  legacy: { teamMemberId: string; practiceGroupId: string }[],
) {
  if (group.teamMemberIds !== null) return group.teamMemberIds ?? [];
  // Preserve the declared legacy roster shown by the approved design until an editor
  // chooses explicit relationships. No match is inferred from a person's name.
  const ids = legacy
    .filter((r) => r.practiceGroupId === group.id)
    .map((r) => r.teamMemberId);
  if (group.slug === "laboral-seguridad-social")
    for (const person of people)
      if (
        person.role.toLowerCase() === "labor law" &&
        !/memoriam/i.test(person.title)
      )
        ids.push(person.id);
  return Array.from(new Set(ids));
}
export async function teamPracticeIds(
  member: TeamMember,
  onlyPublished = false,
) {
  const [groups, people, legacy] = await Promise.all([
    editorialDb.select().from(practiceGroups),
    editorialDb.select().from(teamMembers),
    editorialDb.select().from(teamMemberPracticeGroups),
  ]);
  return groups
    .filter(
      (group) =>
        (!onlyPublished || group.published !== false) &&
        resolvedPracticeIds(group, people, legacy).includes(member.id),
    )
    .map((g) => g.id);
}
export async function saveTeamMember(body: unknown, id?: string) {
  const parsed = (id ? teamEditorSchema.partial() : teamEditorSchema).parse(
    body,
  );
  const { practiceGroupIds, ...data } = parsed;
  return editorialDb.transaction(async (tx) => {
    await tx.execute(
      sql`LOCK TABLE practice_groups, team_members IN SHARE ROW EXCLUSIVE MODE`,
    );
    if (id) {
      const [before] = await tx
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, id));
      if (!before) return undefined;
    }
    const groups = await tx.select().from(practiceGroups);
    if (
      practiceGroupIds &&
      (new Set(practiceGroupIds).size !== practiceGroupIds.length ||
        practiceGroupIds.some((x) => !groups.some((g) => g.id === x)))
    )
      throw new z.ZodError([
        {
          code: "custom",
          path: ["practiceGroupIds"],
          message: "Seleccione prácticas existentes sin duplicarlas.",
        },
      ]);
    const people = await tx.select().from(teamMembers);
    const legacy = await tx.select().from(teamMemberPracticeGroups);
    const [member] = id
      ? await tx
          .update(teamMembers)
          .set(data)
          .where(eq(teamMembers.id, id))
          .returning()
      : await tx
          .insert(teamMembers)
          .values({
            ...data,
            order: Math.max(-1, ...people.map((p) => p.order ?? 0)) + 1,
          } as any)
          .returning();
    if (practiceGroupIds !== undefined) {
      for (const group of groups) {
        const before = resolvedPracticeIds(group, people, legacy);
        const after = before.filter((x) => x !== member.id);
        if (practiceGroupIds.includes(group.id)) after.push(member.id);
        if (JSON.stringify(before) !== JSON.stringify(after))
          await tx
            .update(practiceGroups)
            .set({ teamMemberIds: after })
            .where(eq(practiceGroups.id, group.id));
      }
      await tx
        .delete(teamMemberPracticeGroups)
        .where(eq(teamMemberPracticeGroups.teamMemberId, member.id));
      if (practiceGroupIds.length)
        await tx
          .insert(teamMemberPracticeGroups)
          .values(
            practiceGroupIds.map((practiceGroupId) => ({
              teamMemberId: member.id,
              practiceGroupId,
            })),
          );
    }
    return member;
  });
}
export async function validatePracticeRoster(ids: string[] | null | undefined) {
  if (ids === undefined || ids === null) return;
  if (
    new Set(ids).size !== ids.length ||
    ids.some((x) => !z.string().uuid().safeParse(x).success)
  )
    throw new z.ZodError([
      {
        code: "custom",
        path: ["teamMemberIds"],
        message: "Seleccione profesionales válidos y sin duplicados.",
      },
    ]);
  if (
    ids.length &&
    (
      await editorialDb
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(inArray(teamMembers.id, ids))
    ).length !== ids.length
  )
    throw new z.ZodError([
      {
        code: "custom",
        path: ["teamMemberIds"],
        message: "Un profesional seleccionado ya no existe.",
      },
    ]);
}
