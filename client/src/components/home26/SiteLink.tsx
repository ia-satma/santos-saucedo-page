import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link } from "wouter";
export const SiteLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(({ href, children, ...props }, ref) =>
  /^https:\/\//i.test(href) ? (
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
    <Link {...props} ref={ref} href={href}>
      {children}
    </Link>
  ),
);
