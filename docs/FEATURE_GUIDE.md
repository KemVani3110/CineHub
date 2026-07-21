# CineHub Feature Guide

This guide summarizes the current user-facing flow for CineHub v2.11.0.

## Notification Bell

The header notification bell uses Firestore-backed notifications from `/api/notifications`.

- Shows unread counts in the header.
- Refreshes when opened and polls periodically.
- Supports source chips for system, watchlist, source report, contact, and admin events.
- Lets users mark one notification as read, mark all as read, remove read items, and clear read notifications.
- Opens the linked page when a notification has an `href`.

Typical notification sources:

- Watchlist: item saved updates.
- Source report: report status and source quality updates.
- Contact: message and reply activity.
- Admin: important account or admin workflow activity.

## Smart History

The History page is backed by `/api/history` and local Zustand state.

- Keeps the latest watched movie or TV episode as the continue-watching item.
- Supports type filters for all, movies, and TV.
- Supports search by title or episode label.
- Supports sorting by recently watched, oldest first, and title.
- Shows activity buckets for Today, This week, and Earlier.
- Shows progress hints so cards feel closer to a real streaming history view.

## Movie And TV Detail Polish

Movie and TV detail pages now communicate playback state more clearly.

- Released titles show `Available to watch`.
- Future titles show `Coming soon`.
- Upcoming titles use trailer mode when a TMDB trailer exists.
- Media tabs include a featured trailer panel before the smaller video grid.
- Actor cards are more compact and consistent across movie and TV cast tabs.

## Profile Dashboard

The Profile page now reads real profile stats from `/api/profile/stats`.

- Watched count from `watch_history`.
- Watchlist count from `watchlists`.
- Rating count from `ratings`.
- Favorite actor count from `favorite_actors`.
- Recent activity timeline from watched, saved, and favorite actor records.
- Account security panel shows provider and password availability.
- Avatar picker remains connected to the existing avatar API and profile update flow.

## Maintenance Notes

- Keep notification sources aligned with `src/lib/notifications.ts`.
- Keep profile stats collection names aligned with API route handlers.
- When changing detail-page availability logic, keep movie release dates and TV first-air dates timezone-stable.
- For major user-facing updates, bump `package.json`, `package-lock.json`, and `src/lib/app-info.ts`.
