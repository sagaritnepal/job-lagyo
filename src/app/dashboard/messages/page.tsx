import { MessageCircle } from "lucide-react";

export const metadata = {
  title: "Messages — Job Lagyo",
};

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-white p-14 text-center">
        <MessageCircle className="h-8 w-8 text-neutral-300" />
        <p className="text-sm text-neutral-500">
          Direct messaging with candidates is coming soon. For now, review
          applications and cover letters from the Applications tab.
        </p>
      </div>
    </div>
  );
}
