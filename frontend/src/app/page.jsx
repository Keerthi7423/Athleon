"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FatigueChart from '@/components/FatigueChart';
import MomentumChart from '@/components/MomentumChart';
import LiveMatchStats from '@/components/LiveMatchStats';
import PlayerPerformanceTable from '@/components/PlayerPerformanceTable';
import RealtimeEventFeed from '@/components/RealtimeEventFeed';
import { socketService } from '@/services/socket';
import { getMatchAnalytics } from '@/services/api';

export default function Dashboard() {
  const [matchData, setMatchData] = useState(null);
  const [events, setEvents] = useState([]);
  const [momentumData, setMomentumData] = useState([]);

  useEffect(() => {
    // Connect websocket
    socketService.connect();

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const data = await getMatchAnalytics('123'); // Example ID
        setMatchData(data);
      } catch (error) {
        console.error('Failed to fetch match analytics', error);
      }
    };

    fetchInitialData();

    // Register Web Socket listensers
    socketService.on('momentumShift', (data) => {
      setMomentumData(prev => [...prev.slice(-10), data]);
    });

    socketService.on('scoreUpdate', (data) => {
      setMatchData(prev => ({
        ...prev,
        homeTeamScore: data.home,
        awayTeamScore: data.away
      }));
    });

    // Mock live event for demo if not using real backend yet
    const demoEventInterval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        type: ['PASS', 'SHOT', 'FOUL', 'YELLOW_CARD', 'GOAL'][Math.floor(Math.random() * 5)],
        time: Math.floor(Math.random() * 90) + 1,
        title: 'Event Update',
        description: 'Action occurred on the field'
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 15));
    }, 5000);

    return () => {
      clearInterval(demoEventInterval);
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-6 max-w-7xl">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between py-6 border-b border-slate-800"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
          Athleon Command Center
        </h1>
        <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Live Broadcast</span>
        </div>
      </motion.header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Row: Key Metrics */}
        <div className="col-span-1 lg:col-span-2">
          <MomentumChart momentumData={momentumData} />
        </div>

        <LiveMatchStats matchData={matchData} />

        {/* Second Row */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <FatigueChart data={[]} />
          <PlayerPerformanceTable players={[]} />
        </div>

        {/* Right Sidebar: Timeline */}
        <div className="col-span-1 row-span-2">
          <RealtimeEventFeed events={events} />
        </div>
      </main>
    </div>
  );
}
