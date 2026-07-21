# CineHub Feature Guide

This guide summarizes the current user-facing and admin-facing behavior for CineHub v2.11.0.

## Home

- Hero section renders with a stable fallback-backed item so the first screen does not wait for every below-fold request.
- Recommended section uses user watchlist/history signals when available and trending fallbacks when needed.
- Header includes navigation, profile access, and the notification bell.
- Footer presents the project as a portfolio product and links to owner information.

## Explore

- Users can switch between Movies and TV Shows.
- Filters include sort, genre, year, runtime, and date range.
- Mobile and tablet layouts use larger touch targets and cleaner spacing.
- Vietnamese genre support is included as a practical discovery option.
- Reset clears filters back to the default browse state.

## Search

- Search supports movies, TV shows, and people.
- Results use shared media cards where possible.
- Actor/person results navigate to actor detail pages.

## Movie And TV Detail

- Released titles show `Available to watch`.
- Future titles show `Coming soon`.
- Upcoming titles use trailer mode when a TMDB trailer exists.
- Detail pages include overview, cast, reviews, photos/videos, and similar content.
- TV detail includes season and episode navigation.
- Trailer sections highlight the best available trailer before the smaller media grid.
- Actor cards are compact and consistent across movie and TV detail pages.

## Actor Detail

- Actor pages show a redesigned profile layout.
- Users can favorite actors.
- Users can share actor pages.
- Known-for movie and TV cards use consistent card behavior.
- The page avoids floating action buttons that overlap the actor portrait.

## Watch Experience

- Movie watch pages resolve sources from `/api/stream/[type]/[id]`.
- TV watch pages resolve episode sources from `/api/stream/tv/[id]/season/[seasonNumber]/episode/[episodeNumber]`.
- Source ranking prefers TMDB-aware and explicit providers.
- Active source reports can annotate or deprioritize sources.
- Users can report wrong, broken, slow, or low-quality playback.
- Unreleased content can fall back to trailer playback when available.
- Player controls are designed for desktop, tablet, portrait mobile, and landscape mobile.

## Watchlist

- Users can save movies and TV shows.
- Watchlist cards stay practical and compact.
- Saved items use real metadata where possible.
- Removing an item updates the list without requiring a full app restart.

## Smart History

The History page is backed by `/api/history` and local Zustand state.

- Keeps watched movies and TV episodes.
- Supports type filters for all, movies, and TV.
- Supports search by title or episode label.
- Supports sorting by recently watched, oldest first, and title.
- Shows activity buckets for Today, This week, and Earlier.
- Shows progress hints so cards feel closer to a real streaming history view.
- Provides resume actions for previously watched content.

## Profile

The Profile page reads real profile stats from `/api/profile/stats`.

- Watched count from `watch_history`.
- Watchlist count from `watchlists`.
- Rating count from `ratings`.
- Favorite actor count from `favorite_actors`.
- Recent activity timeline from watched, saved, and favorite actor records.
- Account security panel shows provider and password availability.
- Avatar picker remains connected to the existing avatar API and profile update flow.

## Notification Bell

The header notification bell uses Firestore-backed notifications from `/api/notifications`.

- Shows unread counts in the header.
- Refreshes when opened and polls periodically.
- Supports source chips for system, watchlist, source report, contact, and admin events.
- Lets users mark one notification as read.
- Lets users mark all notifications as read.
- Lets users remove read items.
- Opens the linked page when a notification has an `href`.

Typical notification sources:

- Watchlist: item saved updates.
- Source report: report status and source quality updates.
- Contact: message and reply activity.
- Admin: important account or admin workflow activity.
- System: general app notices.

## Contact

- Contact page stores submissions in Firestore.
- Server sends email automatically with Nodemailer and SMTP.
- Contact emails use a styled HTML template.
- Admin can read contact messages in the dashboard.
- Admin can reply through the app without opening Gmail manually.

## Admin

Admin starts at Dashboard for the most practical operational view.

| Area | Purpose |
| --- | --- |
| Dashboard | Fast overview of users, activity, reports, messages, and system state. |
| Analytics | Product and usage signals with paginated data sections. |
| User Management | User list, detail dialog, status/role actions, and pagination. |
| Source Reports | Review reported playback issues and update status. |
| Contact Messages | Read messages and reply by email. |
| Activity Logs | Review admin actions and audit context. |
| User Avatar | Manage built-in and uploaded avatars. |
| Settings | Review app, Firebase, TMDB, SMTP, and deployment configuration status. |

Admin UI rules:

- Paginate lists when data grows beyond 5 items.
- Avoid horizontal scrolling in normal dashboard cards.
- Use card-style rows on smaller screens.
- Keep sidebar navigation readable and easy to scan.

## SEO And Portfolio Polish

- App metadata describes CineHub as a portfolio-grade movie and TV app.
- Sitemap and robots are generated from the configured app URL.
- Footer links back to the owner portfolio.
- README and docs explain the project for recruiters, reviewers, and future maintainers.

## Maintenance Notes

- Keep notification sources aligned with `src/lib/notifications.ts`.
- Keep profile stats collection names aligned with `/api/profile/stats`.
- Keep API docs aligned with exported route handlers in `src/app/api`.
- When changing detail-page availability logic, keep movie release dates and TV first-air dates timezone-stable.
- For major user-facing updates, bump `package.json`, `package-lock.json`, and `src/lib/app-info.ts`.
- Do not document real environment secrets.
