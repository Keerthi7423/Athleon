"use client";

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FatigueChart({ data }) {
    const sampleData = data?.length > 0 ? data : [
        { time: '10:00', fatigue: 20 },
        { time: '10:15', fatigue: 25 },
        { time: '10:30', fatigue: 45 },
        { time: '10:45', fatigue: 60 },
        { time: '11:00', fatigue: 75 },
        { time: '11:15', fatigue: 85 }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6"
        >
            <h3 className="text-xl font-semibold mb-4 text-emerald-400">Player Fatigue Index</h3>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Line type="monotone" dataKey="fatigue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
