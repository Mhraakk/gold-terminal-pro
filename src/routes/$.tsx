import { createFileRoute } from "@tanstack/react-router";
import { AppNotFound } from "@/components/not-found";

export const Route = createFileRoute("/$")({
  component: AppNotFound,
});
