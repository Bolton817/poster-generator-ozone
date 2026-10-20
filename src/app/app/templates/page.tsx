import React from "react";
import { TemplateGallery } from "@/components/gallery/TemplateGallery";

export const metadata = {
  title: "Weekly Templates — Ozone Lounge Poster Generator",
  description: "Browse, filter, and customize the seven weekly Ozone Lounge poster templates.",
};

export default function TemplatesPage() {
  return <TemplateGallery />;
}
