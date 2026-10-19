import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WEEKLY_TEMPLATES = [
  {
    templateId: "reddington",
    dayOfWeek: 1,
    name: "Monday Reddington — Old Classics & Sundowners",
    eventTitle: "Old Classics & Sundowners",
    tag: "Best for Monday Sundowners",
    djNames: ["Monsieur Pierre"],
    hostNames: [],
    primaryOffer: "Discounts on all drinks, excluding wine.",
    secondaryOffer: "",
  },
  {
    templateId: "saint",
    dayOfWeek: 2,
    name: "Tuesday Saint — African Night (Afro)",
    eventTitle: "African Night (Afro)",
    tag: "Best for Afrobeat Nights",
    djNames: ["DJ Neb", "DVJ Jojez"],
    hostNames: [],
    primaryOffer: "Discounts on beer buckets and cocktails.",
    secondaryOffer: "",
  },
  {
    templateId: "lannister",
    dayOfWeek: 3,
    name: "Wednesday Lannister — Groovy Wednesday",
    eventTitle: "Groovy Wednesday",
    tag: "Best for Midweek Groove",
    djNames: ["DJ Donben", "DJ Vin"],
    hostNames: [],
    primaryOffer: "Free koroga chicken on the house.",
    secondaryOffer: "Discounts on whiskey bottles, cognac and beer buckets.",
  },
  {
    templateId: "shelby",
    dayOfWeek: 4,
    name: "Thursday Shelby — Karaoke Night",
    eventTitle: "Karaoke Night",
    tag: "Best for Karaoke Night",
    djNames: ["DJ Fab"],
    hostNames: ["Bellah Harriet", "Tito Wagithomo"],
    primaryOffer: "Free tequila shots for singers.",
    secondaryOffer: "Discounts on gin, rum and vodka.",
  },
  {
    templateId: "lothbrok",
    dayOfWeek: 5,
    name: "Friday Lothbrok — Flight Fridays",
    eventTitle: "Flight Fridays",
    tag: "Best for Premium Fridays",
    djNames: ["DJ Slim D", "Mistabrand"],
    hostNames: [],
    primaryOffer: "", // Explicitly empty as per source brief
    secondaryOffer: "",
  },
  {
    templateId: "escobar",
    dayOfWeek: 6,
    name: "Saturday Escobar — Saturday Fiesta",
    eventTitle: "Saturday Fiesta",
    tag: "Best for Saturday Fiesta",
    djNames: ["DVJ Jojez"],
    hostNames: [],
    primaryOffer: "Discounts on whiskey bottles and cognac.",
    secondaryOffer: "",
  },
  {
    templateId: "pinkman",
    dayOfWeek: 0,
    name: "Sunday Pinkman — Old Skool Sundays",
    eventTitle: "Old Skool Sundays",
    tag: "Best for Old Skool Sundays",
    djNames: ["DJ Ngash"],
    hostNames: [],
    primaryOffer: "Discounts on beer buckets.",
    secondaryOffer: "",
  },
];

async function main() {
  console.log("Seeding database with source-backed defaults...");

  // 1. Seed or update default operator user
  const operator = await prisma.user.upsert({
    where: { username: "ozone_operator" },
    update: {
      name: "Ozone Lounge Operator",
      role: "operator",
    },
    create: {
      username: "ozone_operator",
      name: "Ozone Lounge Operator",
      email: "operator@ozonelounge.internal",
      role: "operator",
    },
  });

  // 2. Seed or update default admin user
  await prisma.user.upsert({
    where: { username: "ozone_admin" },
    update: {
      name: "Ozone Lounge Administrator",
      role: "admin",
    },
    create: {
      username: "ozone_admin",
      name: "Ozone Lounge Administrator",
      email: "admin@ozonelounge.internal",
      role: "admin",
    },
  });

  console.log(`Verified default users: ${operator.username}`);

  // 3. Seed canonical baseline draft recipes for the seven weekly templates
  for (const tpl of WEEKLY_TEMPLATES) {
    const existingDraft = await prisma.posterDraft.findFirst({
      where: {
        userId: operator.id,
        templateId: tpl.templateId,
      },
    });

    const canonicalDocument = {
      schemaVersion: 1,
      templateId: tpl.templateId,
      templateVersion: 1,
      name: tpl.name,
      canvas: {
        width: 1080,
        height: 1350,
        format: "portrait-4x5",
      },
      content: {
        dayLabel: tpl.name.split(" ")[0],
        eventTitle: tpl.eventTitle,
        dateText: "",
        startTime: "",
        venueName: "Ozone Lounge",
        locationText: "",
        contactText: "",
        socialHandle: "@ozonelounge",
        primaryOffer: tpl.primaryOffer,
        secondaryOffer: tpl.secondaryOffer,
        djNames: tpl.djNames,
        hostNames: tpl.hostNames,
        customLines: [],
      },
      assets: {
        logoAssetId: null,
        backgroundAssetId: null,
        secondaryAssetIds: [],
      },
      styling: {
        paletteId: "default",
        typographyPresetId: "default",
        layoutOptionId: "default",
        decorationOptions: {},
        focalPoints: {
          background: { x: 0.5, y: 0.5 },
        },
      },
    };

    if (existingDraft) {
      await prisma.posterDraft.update({
        where: { id: existingDraft.id },
        data: {
          name: tpl.name,
          document: canonicalDocument,
          templateVersion: 1,
          schemaVersion: 1,
        },
      });
    } else {
      await prisma.posterDraft.create({
        data: {
          name: tpl.name,
          templateId: tpl.templateId,
          templateVersion: 1,
          schemaVersion: 1,
          document: canonicalDocument,
          userId: operator.id,
        },
      });
    }
  }

  const count = await prisma.posterDraft.count();
  console.log(`Database seeding completed successfully. Total drafts: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
