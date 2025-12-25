'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  User, Save, GraduationCap, Calendar, MapPin, IdCard, Edit3, Check, 
  Camera, Building, DoorOpen, Phone, Mail, Upload
} from 'lucide-react'
import Image from 'next/image'

interface StudentProfile {
  id: string
  universityName: string
  studentId: string
  program: string
  yearOfStudy: number
  expectedGraduation: string
  hostelName: string | null
  roomNumber: string | null
  nationalId: string | null
  dateOfBirth: string | null
  address: string | null
  trustScore: number
  isEligible: boolean
  maxLoanAmount: number
  user: {
    email: string
    firstName: string
    lastName: string
    phone: string | null
    profileImage: string | null
  }
}

const ASHESI_HOSTELS = [
  'Akuafo Hall',
  'Independence Hall',
  'Unity Hall',
  'Solidarity Hall',
  'Off-Campus'
]

export default function StudentProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    universityName: 'Ashesi University',
    studentId: '',
    program: '',
    yearOfStudy: '1',
    expectedGraduation: '',
    hostelName: '',
    roomNumber: '',
    nationalId: '',
    dateOfBirth: '',
    address: '',
  })

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.id) {
          setProfile(data)
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone || '',
            universityName: data.universityName || 'Ashesi University',
            studentId: data.studentId || '',
            program: data.program || '',
            yearOfStudy: String(data.yearOfStudy) || '1',
            expectedGraduation: data.expectedGraduation ? new Date(data.expectedGraduation).toISOString().split('T')[0] : '',
            hostelName: data.hostelName || '',
            roomNumber: data.roomNumber || '',
            nationalId: data.nationalId || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            address: data.address || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setProfile(prev => prev ? { ...prev, user: { ...prev.user, profileImage: data.url } } : null)
        setMessage('Profile photo updated!')
      }
    } catch (error) {
      setMessage('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const method = profile ? 'PUT' : 'POST'
      const res = await fetch('/api/students', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setMessage('Profile saved successfully!')
      setProfile(data)
      setIsEditing(false)
    } catch (err: any) {
      setMessage(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal and academic information</p>
        </div>
        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-ashesi-pattern opacity-10"></div>
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-secondary-400/50 overflow-hidden">
              {profile?.user.profileImage ? (
                <Image src={profile.user.profileImage} alt="Profile" width={112} height={112} className="rounded-full object-cover w-full h-full" />
              ) : (
                <User className="w-14 h-14 text-white/80" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary-400 transition-colors group-hover:scale-110"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
            <p className="text-primary-100 flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {session?.user?.email}
            </p>
            {profile && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {profile.studentId}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${profile.isEligible ? 'bg-emerald-400/30' : 'bg-red-400/30'}`}>
                  {profile.isEligible ? '✓ Eligible for Loans' : '✗ Not Eligible'}
                </span>
                <span className="px-4 py-1.5 bg-secondary-500/30 rounded-full text-sm font-medium">
                  Trust Score: {profile.trustScore}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.includes('success') || message.includes('updated') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {(message.includes('success') || message.includes('updated')) && <Check className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Profile Form / Display */}
      {!profile || isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="+233..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <GraduationCap className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Academic Information</h3>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-primary-900">Ashesi University</p>
                <p className="text-sm text-primary-600">Berekuso, Ghana</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="e.g., 12345678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                >
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                required
              >
                <option value="">Select your program</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Management Information Systems">Management Information Systems</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Computer Engineering">Computer Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation Date</label>
              <input
                type="date"
                value={formData.expectedGraduation}
                onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Hostel Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Building className="w-5 h-5 text-secondary-500" />
              <h3 className="font-semibold text-gray-900">Hostel Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name</label>
                <select
                  value={formData.hostelName}
                  onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                >
                  <option value="">Select your hostel</option>
                  {ASHESI_HOSTELS.map(hostel => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="e.g., A-101"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : profile ? 'Update Profile' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (

        /* Profile View Mode */
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
              <User className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{profile.user.firstName} {profile.user.lastName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">{profile.user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">National ID</p>
                  <p className="font-medium text-gray-900">{profile.nationalId || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{profile.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
              <GraduationCap className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Academic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium text-gray-900">{profile.universityName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900">{profile.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium text-gray-900">{profile.program}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year of Study</p>
                  <p className="font-medium text-gray-900">Year {profile.yearOfStudy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Graduation</p>
                  <p className="font-medium text-gray-900">{new Date(profile.expectedGraduation).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Loan Amount</p>
                  <p className="font-medium text-emerald-600">{profile.maxLoanAmount.toLocaleString()} GHC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hostel Information */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
              <Building className="w-5 h-5 text-secondary-500" />
              <h3 className="font-semibold text-gray-900">Hostel Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <Building className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hostel</p>
                  <p className="font-medium text-gray-900">{profile.hostelName || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="font-medium text-gray-900">{profile.roomNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
