'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Appointment {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  location: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
}

export default function StudentAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [])

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; border: string; text: string; icon: any; label: string }> = {
      pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertCircle, label: 'Pending Confirmation' },
      confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: CheckCircle, label: 'Confirmed' },
      completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, label: 'Completed' },
      cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
    }
    return configs[status] || configs.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const upcomingAppointments = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const pastAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status))

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View your scheduled meetings with the admin office</p>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => {
              const config = getStatusConfig(appointment.status)
              const Icon = config.icon
              return (
                <div key={appointment.id} className={`${config.bg} ${config.border} border rounded-2xl p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{appointment.title}</h3>
                      {appointment.description && (
                        <p className="text-gray-600 mt-1">{appointment.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.text} ${config.bg}`}>
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                      <Calendar className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                      <MapPin className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{appointment.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h2>
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {pastAppointments.map(appointment => {
                const config = getStatusConfig(appointment.status)
                const Icon = config.icon
                return (
                  <div key={appointment.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.text}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
