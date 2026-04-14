'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Target, Clock, CheckCircle, Plus, X, Lock, LogOut, User, Building2, Flame, TrendingUp, Menu } from 'lucide-react';

export default function AffluoTaskApp() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('personal');

  const [personalTasks, setPersonalTasks] = useState<any[]>([]);
  const [businessTasks, setBusinessTasks] = useState<any[]>([]);
  const [weeklyCalendar, setWeeklyCalendar] = useState<any[]>([]);
  const [dayLocked, setDayLocked] = useState(false);
  const [streak, setStreak] = useState(0);

  const [newTaskText, setNewTaskText] = useState('');
  const [newEventText, setNewEventText] = useState('');
  const [newEventDay, setNewEventDay] = useState('Ponedjeljak');
  const [newEventTime, setNewEventTime] = useState('');
  const [username, setUsername] = useState('');

  const days = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      saveUserData();
    }
  }, [personalTasks, businessTasks, weeklyCalendar, dayLocked, streak]);

  useEffect(() => {
    if (currentUser && showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, showWelcome]);

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('affluo-users');
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const saveUsers = (updatedUsers: any[]) => {
    localStorage.setItem('affluo-users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const saveUserData = () => {
    if (!currentUser) return;
    const updatedUsers = users.map((u: any) =>
      u.id === currentUser.id
        ? { ...u, personalTasks, businessTasks, weeklyCalendar, dayLocked, streak, lastActive: new Date().toISOString() }
        : u
    );
    saveUsers(updatedUsers);
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setPersonalTasks(user.personalTasks || []);
    setBusinessTasks(user.businessTasks || []);
    setWeeklyCalendar(user.weeklyCalendar || []);
    setDayLocked(user.dayLocked || false);
    setStreak(user.streak || 0);
    setView('dashboard');
    setShowWelcome(true);
  };

  const handleCreateUser = () => {
    if (!username.trim()) {
      alert('Molim te unesi ime!');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: username.trim(),
      personalTasks: [],
      businessTasks: [],
      weeklyCalendar: [],
      dayLocked: false,
      streak: 0,
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setUsername('');
    handleLogin(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setActiveTab('personal');
    setShowWelcome(true);
  };

  const addTask = (category: string) => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    if (category === 'personal') {
      setPersonalTasks([...personalTasks, newTask]);
    } else {
      setBusinessTasks([...businessTasks, newTask]);
    }
    setNewTaskText('');
  };

  const toggleTask = (id: number, category: string) => {
    if (dayLocked) return;
    if (category === 'personal') {
      setPersonalTasks(personalTasks.map((t: any) => t.id === id ? { ...t, completed: !t.completed } : t));
    } else {
      setBusinessTasks(businessTasks.map((t: any) => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = (id: number, category: string) => {
    if (category === 'personal') {
      setPersonalTasks(personalTasks.filter((t: any) => t.id !== id));
    } else {
      setBusinessTasks(businessTasks.filter((t: any) => t.id !== id));
    }
  };

  const addEvent = () => {
    if (!newEventText.trim() || !newEventTime) return;
    const newEvent = {
      id: Date.now(),
      day: newEventDay,
      time: newEventTime,
      text: newEventText.trim(),
      completed: false
    };
    setWeeklyCalendar([...weeklyCalendar, newEvent]);
    setNewEventText('');
    setNewEventTime('');
  };

  const toggleEvent = (id: number) => {
    setWeeklyCalendar(weeklyCalendar.map((e: any) => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const deleteEvent = (id: number) => {
    setWeeklyCalendar(weeklyCalendar.filter((e: any) => e.id !== id));
  };

  const lockDay = () => {
    if (window.confirm('Zaključati dan? Nećeš moći mijenjati današnje taskove!')) {
      setDayLocked(true);
      const allCompleted = [...personalTasks, ...businessTasks].every((t: any) => t.completed);
      if (allCompleted) {
        setStreak(streak + 1);
      }
    }
  };

  const getCompletionRate = () => {
    const allTasks = [...personalTasks, ...businessTasks];
    if (allTasks.length === 0) return 0;
    const completed = allTasks.filter((t: any) => t.completed).length;
    return Math.round((completed / allTasks.length) * 100);
  };

  const getMotivationalMessage = () => {
    const rate = getCompletionRate();
    const messages = [
      { threshold: 100, msg: "🔥 PERFEKTNO! Ti si CEO MAŠINA!" },
      { threshold: 80, msg: "💪 ODLIČNO! Još malo do vrha!" },
      { threshold: 60, msg: "⚡ SOLIDNO! Nastavi jače!" },
      { threshold: 40, msg: "🎯 FOKUS! Možeš bolje!" },
      { threshold: 0, msg: "⏰ KRENI! Danas je tvoj dan!" }
    ];
    return messages.find(m => rate >= m.threshold)!.msg;
  };

  const AffluoLogo = () => (
    <svg viewBox="0 0 200 200" className="w-16 h-16">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M 60 150 L 100 50 L 140 150 L 120 150 L 100 100 L 80 150 Z"
        fill="url(#logoGradient)"
        transform="rotate(-15 100 100)"
      />
    </svg>
  );

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
        `}</style>
        <div className="max-w-md w-full animate-fadeIn">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6 animate-pulse-slow">
              <AffluoLogo />
            </div>
            <h1 className="text-5xl font-light text-white mb-2 tracking-tight">Affluo</h1>
            <p className="text-gray-400 text-sm tracking-wider">TASK MANAGER 2026</p>
          </div>
          {users.length > 0 && (
            <div className="mb-8">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Existing Users</p>
              <div className="space-y-2">
                {users.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-4 text-white text-left transition-all duration-200 flex items-center gap-3"
                  >
                    <User size={18} className="text-gray-400" />
                    <span className="font-light">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">New User</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
              placeholder="Enter your name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-white transition-colors mb-3 font-light"
            />
            <button
              onClick={handleCreateUser}
              className="w-full bg-white text-black rounded-lg px-6 py-3 font-light hover:bg-gray-100 transition-all"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        `}</style>
        <div className="text-center animate-fadeIn">
          <div className="flex justify-center mb-8">
            <AffluoLogo />
          </div>
          <h1 className="text-5xl font-light text-white mb-6">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-2xl text-gray-400 font-light mb-4">
            {getMotivationalMessage()}
          </p>
          <p className="text-lg text-gray-500 font-light">
            What&apos;s on the agenda today?
          </p>
        </div>
      </div>
    );
  }

  const completionRate = getCompletionRate();
  const allTasks = [...personalTasks, ...businessTasks];
  const completedCount = allTasks.filter((t: any) => t.completed).length;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fadeIn">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <AffluoLogo />
              </div>
              <div>
                <h1 className="text-2xl font-light text-white">{currentUser?.name}</h1>
                <p className="text-sm text-gray-500 font-light">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors p-2">
              <LogOut size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Flame className="text-orange-500" size={20} />
            <span className="text-3xl font-light">{streak}</span>
            <span className="text-gray-500 text-sm font-light">day streak</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
            <p className="text-lg font-light text-white mb-2">{getMotivationalMessage()}</p>
            <p className="text-sm text-gray-400 mb-4 font-light">
              {completionRate}% complete • {completedCount}/{allTasks.length} tasks
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {!dayLocked ? (
            <button
              onClick={lockDay}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-4 text-white font-light transition-all flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              Lock Day
            </button>
          ) : (
            <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4 text-center">
              <p className="text-green-400 font-light flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Day Locked
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-zinc-800">
          {['personal', 'business', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 font-light transition-all ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'personal' && <User size={16} />}
                {tab === 'business' && <Building2 size={16} />}
                {tab === 'calendar' && <Calendar size={16} />}
                <span className="hidden sm:inline capitalize">{tab}</span>
              </div>
            </button>
          ))}
        </div>

        {(activeTab === 'personal' || activeTab === 'business') && (
          <div className="animate-fadeIn">
            {!dayLocked && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask(activeTab)}
                  placeholder="Add new task..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-white transition-colors font-light"
                />
                <button
                  onClick={() => addTask(activeTab)}
                  className="bg-white text-black rounded-lg px-4 hover:bg-gray-100 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
            <div className="space-y-2">
              {(activeTab === 'personal' ? personalTasks : businessTasks).map((task: any) => (
                <div
                  key={task.id}
                  className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-3 transition-all ${!dayLocked ? 'hover:border-zinc-700 cursor-pointer' : ''}`}
                  onClick={() => !dayLocked && toggleTask(task.id, activeTab)}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    disabled={dayLocked}
                    className="w-5 h-5 cursor-pointer accent-white"
                  />
                  <span className={`flex-1 font-light ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.text}
                  </span>
                  {!dayLocked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id, activeTab); }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              {(activeTab === 'personal' ? personalTasks : businessTasks).length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <p className="font-light">No tasks yet</p>
                  <p className="text-sm font-light mt-1">Add your first task to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-light text-white mb-4">New Meeting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={newEventDay}
                  onChange={(e) => setNewEventDay(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white transition-colors font-light"
                >
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white transition-colors font-light"
                />
                <input
                  type="text"
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                  placeholder="Meeting description..."
                  className="bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-white transition-colors font-light"
                />
              </div>
              <button
                onClick={addEvent}
                className="w-full mt-3 bg-white text-black rounded-lg px-6 py-3 font-light hover:bg-gray-100 transition-all"
              >
                Add Meeting
              </button>
            </div>
            {days.map(day => {
              const dayEvents = weeklyCalendar.filter((e: any) => e.day === day);
              return (
                <div key={day} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-light text-white mb-4">{day}</h3>
                  {dayEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 font-light">No meetings scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dayEvents.map((event: any) => (
                        <div
                          key={event.id}
                          className="bg-black border border-zinc-800 rounded-lg p-4 flex items-center gap-3 hover:border-zinc-700 cursor-pointer transition-all"
                          onClick={() => toggleEvent(event.id)}
                        >
                          <input type="checkbox" checked={event.completed} onChange={() => {}} className="w-5 h-5 cursor-pointer accent-white" />
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-light text-white">{event.time}</span>
                          <span className={`flex-1 font-light ${event.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {event.text}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
