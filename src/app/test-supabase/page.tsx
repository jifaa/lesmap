"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestSupabasePage() {
    const [status, setStatus] = useState("Ngecek koneksi...");
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        async function testConnection() {
            const { data, error } = await supabase
                .from("categories")
                .select("*");

            if (error) {
                console.error("Supabase error:", error);
                setStatus("Gagal konek ke Supabase ❌");
                return;
            }

            setData(data ?? []);
            setStatus("Berhasil konek ke Supabase ✅");
        }

        testConnection();
    }, []);

    return (
        <main style={{ padding: 40 }}>
            <h1>Test Supabase</h1>
            <p>{status}</p>

            <pre>{JSON.stringify(data, null, 2)}</pre>
        </main>
    );
}