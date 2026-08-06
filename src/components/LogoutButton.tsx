import { signOutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-neutral-600 hover:text-primary-700 cursor-pointer"
      >
        Log out
      </button>
    </form>
  );
}
