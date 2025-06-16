import { Metadata } from "next";
import { getActorDetails } from "@/services/tmdb";
import ActorDetail from "@/components/actor/ActorDetail";
import { notFound } from "next/navigation";

interface ActorPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ActorPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const actor = await getActorDetails(id);

    if (!actor) {
      return {
        title: "Actor Not Found",
        description: "The requested actor could not be found.",
      };
    }

    return {
      title: `${actor.name} - CineHub`,
      description: actor.biography || `Learn more about ${actor.name} and their work in movies and TV shows.`,
    };
  } catch (error) {
    return {
      title: "Error",
      description: "An error occurred while loading the actor details.",
    };
  }
}

export default async function ActorPage({ params }: ActorPageProps) {
  try {
    const { id } = await params;
    const actor = await getActorDetails(id);

    if (!actor) {
      notFound();
    }

    return <ActorDetail actor={actor} />;
  } catch (error) {
    notFound();
  }
} 