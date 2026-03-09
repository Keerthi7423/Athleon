"use client";

import { motion, AnimatePresence } from 'framer-motion';

export default function RealtimeEventFeed({ events }) {
    const getEventIcon = (type) => {
        switch (type) {
            case 'GOAL': return '⚽';
            case 'YELLOW_CARD': return '🟨';
            case 'RED_CARD': return '🟥';
            case 'SUBSTITUTION': return '🔁';
            default: return '⚡';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 h-full flex flex-col"
        >
            <h3 className="text-xl font-semibold mb-4 text-indigo-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-ping" />
                Live Events Feed
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                <AnimatePresence>
                    {events?.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Waiting for match events...</p>
                    ) : (
                        events?.map((event, index) => (
                            <motion.div
                                key={event.id || index}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-700/30 p-3 rounded-lg flex items-start gap-4"
                            >
                                <div className="text-2xl mt-1">{getEventIcon(event.type)}</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400">{event.time}'</span>
                                        <span className="font-medium text-slate-200">{event.title}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
