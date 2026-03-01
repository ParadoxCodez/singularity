import { redirect } from "next/navigation";
import { useRouter } from 'next/navigation';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AppNavbar from "@/components/AppNavbar";
import MobileNav from "@/components/MobileNav";
import NavigationProgress from "@/components/NavigationProgress";
import { ProfileProvider } from '@/lib/profile-context';

async function getUser() {
    const cookieStore = cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user;
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user) {
        redirect("/auth");
    }

    return (
        <>
            <NavigationProgress />
            <AppNavbar />
            <MobileNav />
            <main className="pt-4 lg:pt-[60px] pb-24 lg:pb-0 min-h-screen bg-[#0A0A0F]">
                {children}
            </main>
        </>
    );
}
