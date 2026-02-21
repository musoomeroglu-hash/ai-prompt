'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';

// ANTIGRAVITY Extension ID
// Kullanıcı yerel olarak yüklediğinde bu ID değişebilir.
// chrome://extensions sayfasından ID'yi alıp buraya yazması gerekebilir.
const EXTENSION_ID = "mboaeojocbgiggegjmjofpbegeccjmbl"; // Örnek ID

export function ExtensionSync() {
    const supabase = createClient();

    useEffect(() => {
        const syncToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const chrome = (window as any).chrome;

            if (session?.access_token && typeof chrome !== 'undefined' && chrome.runtime) {
                try {
                    chrome.runtime.sendMessage(
                        EXTENSION_ID,
                        { type: "SET_AUTH_TOKEN", token: session.access_token },
                        (response: any) => {
                            if (chrome.runtime.lastError) {
                                console.warn('Extension not found or not connectable:', chrome.runtime.lastError.message);
                            } else {
                                console.log('Auth token synced with extension:', response);
                            }
                        }
                    );
                } catch (err) {
                    console.warn('Failed to sync with extension:', err);
                }
            }
        };

        // İlk yüklemede ve auth state değiştiğinde senkronize et
        syncToken();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const chrome = (window as any).chrome;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                syncToken();
            } else if (event === 'SIGNED_OUT') {
                // Token'ı temizle
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.sendMessage(EXTENSION_ID, { type: "SET_AUTH_TOKEN", token: null });
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    return null;
}
