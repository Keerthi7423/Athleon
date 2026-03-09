"use client";

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MomentumChart({ momentumData }) {
    const sampleData = momentumData?.length > 0 ? momentumData : [
        { time: '00', homeP: 0.50, awayP: 0.50 },
        { time: '15', homeP: 0.55, awayP: 0.45 },
        { time: '30', homeP: 0.40, awayP: 0.60 },
        { time: '45', homeP: 0.65, awayP: 0.35 },
        { time: '60', homeP: 0.70, awayP: 0.30 },
        { time: '75', homeP: 0.50, awayP: 0.50 },
        { time: '90', homeP: 0.45, awayP: 0.55 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
        >
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Emotional Momentum (EMI)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleData}>
                        <defs>
                            <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Area type="monotone" dataKey="homeP" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHome)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
