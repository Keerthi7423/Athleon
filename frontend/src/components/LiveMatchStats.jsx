"use client";

import { motion } from 'framer-motion';

export default function LiveMatchStats({ matchData }) {
    const homeScore = matchData?.homeTeamScore ?? 0;
    const awayScore = matchData?.awayTeamScore ?? 0;
    const status = matchData?.status || 'LIVE';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 flex flex-col items-center justify-center col-span-1"
        >
            <p className="text-sm font-bold tracking-widest text-red-500 animate-pulse mb-4">• {status}</p>
            <div className="flex items-center space-x-8 w-full justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-lg uppercase tracking-wider mb-2">Home</p>
                    <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center text-4xl font-light">
                        {homeScore}
                    </div>
                </div>
                <div className="text-slate-500 text-3xl font-light">-</div>
                <div className="text-center">
                    <p className="text-gray-400 text-lg uppercase tracking-wider mb-2">Away</p>
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center text-4xl font-light">
                        {awayScore}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
