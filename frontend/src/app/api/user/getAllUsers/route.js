import dbConnect from '@/dbConfig/dbConfig'
import User from '@/models/userModel'

export async function GET() {
  try {
    await dbConnect()
    const users = await User.find({}).sort({ createdAt: -1 })
    return Response.json({ success: true, data: users }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}
