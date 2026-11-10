import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeHref } from "@/lib/localeRouting";
export const SiteLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(({ href, children, ...props }, ref) => {
  const { language } = useLanguage();
  const localized = localizeHref(href, language);
  return /^https?:\/\//i.test(href) ? (
    <a
      {...props}
      ref={ref}
      href={href}
      target={props.target || "_blank"}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ) : (
    <Link {...props} ref={ref} href={localized}>
      {children}
    </Link>
  );
});
