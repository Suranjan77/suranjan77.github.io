import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Classroom quiz: privacy",
  description: "What the classroom quiz keeps about students, where it goes, and when it is deleted.",
  alternates: { canonical: "/play/privacy" },
};

const sections = [
  {
    title: "Your name is never asked for",
    body: [
      "You join with the code on your teacher's screen. The quiz gives you a random nickname made of a colour and an animal, such as \"Blue Otter\". You cannot type your own, so no real name goes into the game.",
      "There are no accounts, no sign-in, no cookies, no adverts and no tracking.",
    ],
  },
  {
    title: "What happens to your answers",
    body: [
      "Your phone sends your answers to your teacher's screen through a relay: a small server on Cloudflare that is set to keep its rooms in the EU. The relay passes messages along. It does not save answers, nicknames or scores.",
      "Your teacher's screen works out the scores. Only the top three nicknames are ever shown to the room. Your own score is shown only on your phone.",
    ],
  },
  {
    title: "When it is deleted",
    body: [
      "When your teacher ends the session, the room is deleted from the relay, and your teacher's screen and your phone delete what they held.",
      "If your teacher closes their screen without ending the session, the room deletes itself after 15 minutes. No room lasts longer than four hours.",
    ],
  },
  {
    title: "What stays on your phone",
    body: [
      "This browser tab keeps a random ID and the room code, so you can rejoin as the same player if the page reloads or your screen locks. They are deleted when the session ends or when you close the tab.",
    ],
  },
  {
    title: "What cannot be avoided",
    body: [
      "Like any website, the servers you connect to see your device's internet (IP) address while you are connected. The site is hosted by GitHub Pages, which keeps server logs for security. The relay is hosted by Cloudflare: the relay does not record your address, but Cloudflare may process connection details to protect its network.",
      "If you have questions about any of this, ask your teacher.",
    ],
  },
] as const;

export default function PlayPrivacyPage() {
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-label text-primary">Classroom quiz</p>
        <h1 className="mt-3 text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
          What the quiz keeps about you
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          Almost nothing, and only while the game is running.
        </p>

        <div className="mt-10 grid gap-px border border-outline bg-outline">
          {sections.map((section) => (
            <section key={section.title} className="bg-surface p-6 sm:p-8">
              <h2 className="font-headline text-2xl font-medium text-on-surface">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-7 text-on-surface-variant">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10">
          <Link href="/play" className="text-primary underline underline-offset-4">Back to the quiz</Link>
        </p>
      </div>
    </div>
  );
}
