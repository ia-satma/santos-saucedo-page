import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export interface RankingItem {
  publication: string;
  ranking: string;
  rankingEs?: string;
  year?: string | number;
  badgeType?: string;
}

interface RankingsListProps {
  items: RankingItem[];
  language: string;
  getBadgeStyles?: (badgeType: string) => string;
  getBadgeIcon?: (badgeType: string) => ReactNode;
  testIdPrefix?: string;
}

// Lista de filetes: publicación en Gris Tinta, año como etiqueta y la banda en un chip de 1 px.
export function RankingsList({
  items,
  language,
  getBadgeStyles,
  getBadgeIcon,
  testIdPrefix = "ranking",
}: RankingsListProps) {
  return (
    <ul className="border-b border-ss-rule" data-testid={`list-${testIdPrefix}s`}>
      {items.map((item, index) => {
        const displayRanking =
          language === "es" && item.rankingEs ? item.rankingEs : item.ranking;
        return (
          <li
            key={index}
            className="flex items-center justify-between gap-4 py-4 border-t border-ss-rule"
            data-testid={`card-${testIdPrefix}-${index}`}
          >
            <div className="flex items-baseline gap-4 min-w-0 flex-1">
              <p
                className="text-ss-tinta truncate"
                data-testid={`text-${testIdPrefix}-publication-${index}`}
              >
                {item.publication}
              </p>
              {item.year && (
                <span
                  className="hidden sm:inline ss-label text-ss-medio shrink-0"
                  data-testid={`text-${testIdPrefix}-year-${index}`}
                >
                  {item.year}
                </span>
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-sm font-normal flex items-center gap-1 shrink-0 ${
                getBadgeStyles ? getBadgeStyles(item.badgeType ?? "") : "border-ss-rule text-ss-tinta bg-transparent"
              }`}
              data-testid={`badge-${testIdPrefix}-${index}`}
            >
              {getBadgeIcon && getBadgeIcon(item.badgeType ?? "")}
              {displayRanking}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
