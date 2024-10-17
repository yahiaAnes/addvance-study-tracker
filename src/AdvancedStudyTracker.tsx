'use client'

import { useState, useEffect } from 'react'
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { PlusCircle, BarChart2, Trash2 } from 'lucide-react'
import { db } from './firebase'
import { ref, onValue, push, update, remove } from 'firebase/database'

interface StudySession {
  date: string;
  duration: number;
}

interface QCMExam {
  date: string;
  score: number;
}

interface Course {
  id: string;
  name: string;
  studySessions: StudySession[];
  qcmExams: QCMExam[];
}

export default function AdvancedStudyTracker() {
  const [courses, setCourses] = useState<Course[]>([])
  const [newCourseName, setNewCourseName] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [newStudyDuration, setNewStudyDuration] = useState('')
  const [newExamScore, setNewExamScore] = useState('')
  const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false)
  const [isQCMDialogOpen, setIsQCMDialogOpen] = useState(false)

  useEffect(() => {
    const coursesRef = ref(db, 'courses')
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const coursesArray = Object.entries(data).map(([id, course]) => ({
          id,
          ...(course as Omit<Course, 'id'>)
        }))
        setCourses(coursesArray)
      } else {
        setCourses([])
      }
    })
  }, [])

  const addCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCourseName.trim() !== '') {
      const coursesRef = ref(db, 'courses')
      push(coursesRef, {
        name: newCourseName.trim(),
        studySessions: [],
        qcmExams: []
      })
      setNewCourseName('')
    }
  }

  const addStudySession = () => {
    if (selectedCourse && newStudyDuration.trim() !== '') {
      const courseRef = ref(db, `courses/${selectedCourse.id}`)
      const newSession = {
        date: new Date().toISOString().split('T')[0],
        duration: Number(newStudyDuration)
      }
      update(courseRef, {
        studySessions: [...(selectedCourse.studySessions || []), newSession]
      })
      setNewStudyDuration('')
      setIsStudyDialogOpen(false)
    }
  }

  const addQCMExam = () => {
    if (selectedCourse && newExamScore.trim() !== '') {
      const courseRef = ref(db, `courses/${selectedCourse.id}`)
      const newExam = {
        date: new Date().toISOString().split('T')[0],
        score: Number(newExamScore)
      }
      update(courseRef, {
        qcmExams: [...(selectedCourse.qcmExams || []), newExam]
      })
      setNewExamScore('')
      setIsQCMDialogOpen(false)
    }
  }

  const deleteCourse = (courseId: string) => {
    const courseRef = ref(db, `courses/${courseId}`)
    remove(courseRef)
  }

  const getStudySessionsCount = (course: Course) => course.studySessions?.length || 0
  const getAverageExamScore = (course: Course) => {
    if (!course.qcmExams || course.qcmExams.length === 0) return 0
    const totalScore = course.qcmExams.reduce((sum, exam) => sum + exam.score, 0)
    return totalScore / course.qcmExams.length
  }

  const getChartData = (course: Course) => {
    const studyData = course.studySessions?.map((session, index) => ({
      name: `Session ${index + 1}`,
      duration: session.duration
    })) || []
    const examData = course.qcmExams?.map((exam, index) => ({
      name: `Exam ${index + 1}`,
      score: exam.score
    })) || []
    return { studyData, examData }
  }

  const getTotalChartData = () => {
    const totalStudySessions = courses.reduce((total, course) => total + (course.studySessions?.length || 0), 0)
    const totalQCMScores = courses.reduce((total, course) => total + (course.qcmExams?.reduce((sum, exam) => sum + exam.score, 0) || 0), 0)
    const totalQCMExams = courses.reduce((total, course) => total + (course.qcmExams?.length || 0), 0)
    const averageQCMScore = totalQCMExams > 0 ? totalQCMScores / totalQCMExams : 0

    return [
      { name: 'Total Study Sessions', value: totalStudySessions },
      { name: 'Average QCM Score', value: averageQCMScore }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="border border-gray-200 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold">Advanced Study Tracker</h2>
        <p className="text-gray-500">Track your study sessions and QCM exam scores</p>

        <form onSubmit={addCourse} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter course name"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 flex-grow"
          />
          <button type="submit" className="flex items-center justify-center w-full sm:w-auto bg-blue-500 text-white rounded px-4 py-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Course
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border-b text-left p-4">Course</th>
                <th className="border-b text-left p-4">Study Sessions</th>
                <th className="border-b text-left p-4">Avg. QCM Score</th>
                <th className="border-b text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td className="border-b p-4">{course.name}</td>
                  <td className="border-b p-4">{getStudySessionsCount(course)}/4</td>
                  <td className="border-b p-4">{getAverageExamScore(course).toFixed(2)}</td>
                  <td className="border-b p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setIsStudyDialogOpen(true); setSelectedCourse(course) }}
                        className="text-blue-500 border border-blue-500 rounded px-2 py-1 text-sm">
                        Add Session
                      </button>
                      <button
                        onClick={() => { setIsQCMDialogOpen(true); setSelectedCourse(course) }}
                        className="text-blue-500 border border-blue-500 rounded px-2 py-1 text-sm">
                        Add QCM
                      </button>
                      <button className="text-green-500 border border-green-500 rounded px-2 py-1 text-sm">
                        <BarChart2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteCourse(course.id)} className="text-red-500 border border-red-500 rounded px-2 py-1 text-sm">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold">Overall Progress</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getTotalChartData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4A90E2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
