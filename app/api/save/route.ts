import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
//@ts-nocheck

export async function GET() {
  console.log("received");

  const save = await prisma.document.create({
    data: {
      userId: "QnQWSdr8gwxBdXswl5B7fcfJtC34AR5O",
      title: "check",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              id: "CzvqVNh",
            },
            content: [
              {
                type: "text",
                text: "The Sidemen are a British YouTube group consisting of seven members: JJ Olatunji (KSI), Simon Minter (Miniminter), Josh Bradley (Zerkaa), Tobi Brown (TBJZL), Ethan Payne (Behzinga), Harry Lewis (W2S), and Vik Barn (Vikkstar123).",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {
              id: "5HsU6Ka",
            },
            content: [
              {
                type: "text",
                text: "They are known for their diverse content, including challenges, vlogs, gaming videos, and sketches. The group formed in 2013 and has since grown into one of the most popular and influential YouTube channels globally, with a massive following across multiple platforms.",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {
              id: "aFK3Ath",
            },
            content: [
              {
                type: "text",
                text: "Beyond their YouTube success, the Sidemen have expanded their brand into various ventures, such as their own clothing line (Sidemen Clothing), a restaurant chain (Sides), and a popular podcast (SidemenReacts). They have also organized charity football matches that have raised millions for various causes.",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {
              id: "bMfFcV9",
            },
            content: [
              {
                type: "text",
                text: "Their individual members also have successful solo careers. KSI, for instance, is a prominent boxer and musician, having headlined major boxing events and released multiple charting albums. Other members have also ventured into music, fashion, and even professional esports.",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {
              id: "BHyVLwo",
            },
            content: [
              {
                type: "text",
                text: "The group's collaborative spirit and consistent output have cemented their status as a major force in online entertainment. They often engage with their fanbase through social media, Q&A sessions, and live streams, fostering a strong sense of community.",
              },
            ],
          },
        ],
      },
    },
  });

  return NextResponse.json({
    message: "hey",
  });
}
