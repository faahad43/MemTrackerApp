import { NextResponse } from 'next/server'
import dbConnect from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
// import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { firstName, lastName, username, email, password } = body

    // Check if user exists in MongoDB
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email.' }, { status: 400 })
    }

    console.log("the exisiting user in the db: ", existingUser);

    // Create user in Clerk
    const clerkRes = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        username,
        email_address: [email],
        password
      })
    })
    const clerkData = await clerkRes.json()
    console.log("the clerk data after the user created: ", clerkData);
    if (!clerkRes.ok) {
      console.log('Clerk error:', clerkData)
      return NextResponse.json({ error: clerkData.errors?.[0]?.message || 'Clerk user creation failed' }, { status: 400 })
    }
    console.log("the clerk data response: ", clerkRes);

    // Create user in MongoDB
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt)
    // const newUser = new User({
    //   clerkId: clerkData.id,
    //   firstName,
    //   lastName,
    //   username,
    //   email,
    //   password: hashedPassword,
    //   profile_image_url: clerkData.image_url || '',
    //   emailVerified: null
    // })
    // await newUser.save()

    return NextResponse.json({ message: 'User created successfully', success: true })
  } catch (err) {
    console.log("the errro while creating db user: ", err);
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}