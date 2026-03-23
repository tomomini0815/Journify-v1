"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BentoItemProps {
  className?: string;
  children: React.ReactNode;
  showDots?: boolean;
}

const BentoItem = ({ className, children, showDots = false }: BentoItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = () => {
      // Optional: Reset or initial pulse logic
    };

    item.addEventListener('mousemove', handleMouseMove);
    item.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      item.removeEventListener('mousemove', handleMouseMove);
      item.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={itemRef} 
      className={`bento-item shadow-2xl group ${className}`}
      style={{
        position: 'relative',
      }}
    >
      {/* Background patterns */}
      <div className="noise-overlay" />
      {showDots && <div className="absolute inset-0 dot-pattern opacity-30" />}
      
      {/* Dynamic Border Glow */}
      <motion.div 
        className="bento-item-border-glow group-hover:opacity-100"
        style={{
          ['--mouse-x' as any]: useTransform(smoothX, (x) => `${x}px`),
          ['--mouse-y' as any]: useTransform(smoothY, (y) => `${y}px`),
        }}
      />

      {/* Dynamic Spotlight */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: useTransform(
            [smoothX, smoothY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.06), transparent 40%)`
          )
        }}
      />
      
      <div className="bento-content">
        {children}
      </div>
    </div>
  );
};

export const CyberneticBentoGrid = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="flex flex-col items-center mb-12 md:mb-20 space-y-4 md:space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">Next-Gen Platform</span>
        </div>
        <h2 className="text-3xl md:text-7xl font-bold text-white text-center tracking-tight leading-tight">
          主な機能
        </h2>
        <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <p className="text-gray-400 text-center max-w-2xl text-base md:text-xl font-light tracking-premium px-4">
          日々の記録から目標達成まで、あなたの成長をサポートする統合プラットフォーム
        </p>
      </motion.div>

      <div className="bento-grid">
        {/* Journal */}
        <BentoItem className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 flex flex-col justify-between group border-cyan-500/5 p-6 md:p-8">
          <div className="space-y-4 md:space-y-6 relative z-20">
            <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">
              ジャーナル
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-lg max-w-md">
              リッチテキストエディタで自由に思考を記録。AIが内容を分析し、あなたの感情やエネルギーの傾向を可視化します。
            </p>
          </div>
          <div className="mt-8 md:mt-12 relative h-48 md:h-72 rounded-2xl overflow-hidden border border-white/5 bg-black/40 group-hover:border-cyan-500/20 transition-colors duration-500">
            <img 
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200" 
              alt="Journaling"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-3 md:p-4 rounded-xl border border-white/10 group-hover:border-cyan-500/30 transition-all">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest">AI Insights</span>
                  </div>
                  <div className="h-1.5 w-24 md:w-32 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BentoItem>

        {/* Goal Management */}
        <BentoItem className="group border-emerald-500/5 p-6 md:p-8" showDots>
          <div className="h-full flex flex-col relative z-20">
            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 md:mb-3 tracking-tight">
              目標管理
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 md:mb-6">
              短期・長期の目標を詳細に設定。進捗を10%刻みで直感的に更新。
            </p>
            <div className="mt-auto space-y-2 md:space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">
                <span>Progress</span>
                <span>75%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-500" 
                />
              </div>
            </div>
          </div>
        </BentoItem>

        {/* Task Management */}
        <BentoItem className="group border-blue-500/5 p-6 md:p-8">
          <div className="h-full flex flex-col relative z-20">
            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 md:mb-3 tracking-tight">
              タスク管理
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              日々のタスクとプロジェクトを紐付け。完了状態をリアルタイムで追跡。
            </p>
            <div className="mt-6 md:mt-8 flex flex-col gap-2 md:gap-3">
              {[
                { label: 'Weekly Review', done: true, color: 'blue' },
                { label: 'Market Research', done: false, color: 'white' }
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-blue-500/10 transition-colors">
                  <div className={`w-3 h-3 md:w-4 md:h-4 rounded border ${task.done ? 'bg-blue-500 border-blue-400' : 'border-white/20'}`} />
                  <div className={`h-1 rounded-full ${task.done ? 'bg-blue-300/30' : 'bg-white/10'} flex-1`} />
                </div>
              ))}
            </div>
          </div>
        </BentoItem>

        {/* Voice Journal */}
        <BentoItem className="row-span-1 md:row-span-2 group border-cyan-500/5 flex flex-col overflow-hidden p-6 md:p-8">
          <div className="relative z-20">
            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 md:mb-3 tracking-tight">
              音声ジャーナル
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 md:mb-6">
              話すだけでジャーナリングを完了。AIが文字起こしと要約を自動で行います。
            </p>
          </div>
          <div className="mt-auto relative h-48 md:h-[320px] -mx-4 -mb-4 md:-mx-8 md:-mb-8 rounded-t-3xl overflow-hidden border-t border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600" 
              alt="Voice recording"
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1.5 md:gap-2.5 h-12 md:h-16 items-center">
                {[1, 1.5, 0.8, 1.2, 0.6, 1.4, 1.1, 0.9, 1.3].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [`${h * 20}%`, `${h * 90}%`, `${h * 20}%`],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.2 + Math.random(), 
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-1 md:w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </BentoItem>

        {/* Dashboard & Analysis */}
        <BentoItem className="col-span-1 md:col-span-2 group border-indigo-500/5 p-6 md:p-8" showDots>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 h-full items-center relative z-20">
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">
                分析ダッシュボード
              </h3>
              <p className="text-xs md:text-gray-400 leading-relaxed">
                気分、行動、生産性の相関関係を高度なアルゴリズムで可視化。自分だけのインサイトを発見しましょう。
              </p>
            </div>
            <div className="h-24 md:h-32 bg-white/5 rounded-2xl border border-white/5 flex items-end justify-between p-4 md:p-5 gap-1 md:gap-1.5 relative overflow-hidden group-hover:border-indigo-500/20 transition-all">
              <div className="absolute top-2 right-4 flex gap-1">
                <div className="w-1 h-1 rounded-full bg-indigo-500" />
                <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
              </div>
              {[40, 75, 45, 95, 65, 85, 50, 70, 60, 80].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-sm group-hover:opacity-100 opacity-60 transition-opacity"
                />
              ))}
            </div>
          </div>
        </BentoItem>

        {/* Project Management */}
        <BentoItem className="group border-slate-500/5 flex flex-col p-6 md:p-8">
          <div className="relative z-20">
            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-slate-300 transition-colors mb-2 md:mb-3 tracking-tight">
              プロジェクト管理
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              複雑なタスクをプロジェクト単位で整理。ガントチャートで進捗を視覚的に把握。
            </p>
          </div>
          <div className="mt-4 md:mt-6 relative h-48 md:h-full min-h-[120px] md:min-h-[140px] rounded-xl overflow-hidden border border-white/5 bg-black/20 group-hover:border-slate-500/20 transition-all">
            <img 
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200" 
              alt="Project Planning"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-1">
               <div className="w-12 h-1 bg-slate-500/50 rounded-full" />
               <div className="w-8 h-1 bg-slate-500/30 rounded-full" />
            </div>
          </div>
        </BentoItem>
      </div>
    </div>
  );
};
