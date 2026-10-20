import { SITE } from '@/lib/site'

// Shown on every page so nobody mistakes the demo for a real shop.
export default function DemoBanner() {
    return (
        <div className="bg-yellow-500 text-gray-900 text-sm">
            <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
                <span>
                    <strong>Demo store.</strong> A fictional business built for a portfolio. No real payments are taken and nothing is shipped.
                </span>
                <span className="flex items-center gap-3 font-semibold">
                    <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="underline hover:no-underline">Source code</a>
                    {SITE.adminUrl && (
                        <a href={SITE.adminUrl} target="_blank" rel="noreferrer" className="underline hover:no-underline">Admin panel</a>
                    )}
                </span>
            </div>
        </div>
    )
}
