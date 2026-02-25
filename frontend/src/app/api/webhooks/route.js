import { Webhook } from 'svix'
import { headers } from 'next/headers'
import dbConnect from '@/dbConfig/dbConfig'
import User from '@/models/userModel'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400
    })
  }

  const eventType = evt.type

  await dbConnect()

  // Handle user creation
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, username, image_url, public_metadata } = evt.data

    try {
      const newUser = await User.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name || '',
        lastName: last_name || '',
        username: username || email_addresses[0]?.email_address?.split('@')[0],
        profile_image_url: image_url || '',
        role: public_metadata?.role || 'user'
      })

      console.log('User created in MongoDB:', newUser)
      return new Response('User created', { status: 200 })
    } catch (error) {
      console.error('Error creating user in MongoDB:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  // Handle user update
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url, public_metadata } = evt.data

    try {
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address,
          firstName: first_name || '',
          lastName: last_name || '',
          username: username || email_addresses[0]?.email_address?.split('@')[0],
          profile_image_url: image_url || '',
          role: public_metadata?.role || 'user',
          updatedAt: new Date()
        },
        { new: true }
      )

      console.log('User updated in MongoDB:', updatedUser)
      return new Response('User updated', { status: 200 })
    } catch (error) {
      console.error('Error updating user in MongoDB:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await User.findOneAndDelete({ clerkId: id })
      console.log('User deleted from MongoDB')
      return new Response('User deleted', { status: 200 })
    } catch (error) {
      console.error('Error deleting user from MongoDB:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
