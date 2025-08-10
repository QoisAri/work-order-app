// app/components/LogoutButton.tsx
import { signOut } from '../auth/action'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover w-full text-left"
      >
        Logout
      </button>
    </form>
  )
}