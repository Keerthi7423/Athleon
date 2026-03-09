"use client";

import { motion } from 'framer-motion';

export default function PlayerPerformanceTable({ players }) {
    const defaultPlayers = [
        { id: 1, name: 'Alex Sterling', position: 'FWD', rating: 9.2, fatigue: 45 },
        { id: 2, name: 'Jordan Hayes', position: 'MID', rating: 8.7, fatigue: 62 },
        { id: 3, name: 'Chris Vance', position: 'DEF', rating: 8.1, fatigue: 78 },
        { id: 4, name: 'Taylor Scott', position: 'GK', rating: 7.9, fatigue: 20 },
    ];

    const data = players?.length > 0 ? players : defaultPlayers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 col-span-1 lg:col-span-2"
        >
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Player Performance</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-sm">
                            <th className="py-3 px-4 font-medium uppercase">Player</th>
                            <th className="py-3 px-4 font-medium uppercase">Position</th>
                            <th className="py-3 px-4 font-medium uppercase">Match Rating</th>
                            <th className="py-3 px-4 font-medium uppercase">Fatigue Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((player) => (
                            <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                <td className="py-3 px-4 font-medium text-slate-200">{player.name}</td>
                                <td className="py-3 px-4 text-slate-400">{player.position}</td>
                                <td className="py-3 px-4">
                                    <span className="bg-emerald-500/10 text-emerald-400 py-1 px-3 rounded-full text-sm font-semibold">
                                        {player.rating}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${player.fatigue > 75 ? 'bg-red-500' :
                                                        player.fatigue > 50 ? 'bg-amber-400' : 'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${player.fatigue}%` }}
                                            />
                                        </div>
                                        <span className="text-sm w-8">{player.fatigue}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
