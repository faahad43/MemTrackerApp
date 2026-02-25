import { clerkClient } from '@clerk/nextjs/server'
import dbConnect from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import { auth } from '@clerk/nextjs/server'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()
    const { email, password, firstName, lastName, username } = body

    // Create user in Clerk
    const client = await clerkClient()
    const user = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      username,
      publicMetadata: {
        role: 'user'
      }
    })

    // MongoDB sync will happen via webhook
    return Response.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json({ error: error.message || 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, username, password } = body

    // Fetch user from MongoDB to get clerkId
    await dbConnect()
    const user = await User.findById(id)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Update in Clerk
    const client = await clerkClient()
    const updateData = {
      firstName,
      lastName,
      username,
    }

    if (password) {
      updateData.password = password
    }

    await client.users.updateUser(user.clerkId, updateData)

    return Response.json({ success: true, message: 'User updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()
    const user = await User.findById(id)
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete from Clerk
    const client = await clerkClient()
    await client.users.deleteUser(user.clerkId)

    return Response.json({ success: true, message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({ error: error.message || 'Failed to delete user' }, { status: 500 })
  }
}
