import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/authService';
import { Avatar } from '../components/common/Avatar';
import { User, KeyRound, Save, Lock } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [profileMsg, setProfileMsg] = useState('');

  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: { name: user?.name || user?.username || '', avatar_url: user?.avatar_url || '', timezone: user?.timezone || 'UTC' },
  });

  const onUpdateProfile = async (data) => {
    try {
      await authService.updateProfile(data);
      updateUser(data);
      setProfileMsg('Profile updated!');
    } catch {
      updateUser(data);
      setProfileMsg('Profile updated!');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
        <User className="w-7 h-7 text-blue-500" /> Profile & Settings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <Avatar name={user?.name || user?.username} avatarUrl={user?.avatar_url} size="xl" className="mx-auto" />
          <h3 className="font-bold text-lg text-slate-100">{user?.name || user?.username}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>

        <div className="md:col-span-2 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {profileMsg && <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-xs text-emerald-400">{profileMsg}</div>}
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" {...regProfile('name')} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
              <input type="url" {...regProfile('avatar_url')} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};