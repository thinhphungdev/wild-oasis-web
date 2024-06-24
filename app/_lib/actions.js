'use server';

import { revalidatePath } from 'next/cache';
import { signIn, signOut, auth } from './auth';
import { supabase } from './supabase';

export async function signInAction() {
  await signIn('google', {
    redirectTo: '/account',
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: '/',
  });
}

export async function updateGuest(formData) {
  const session = await auth();

  if (!session) throw new Error('You must be logged in');

  const nationalID = formData.get('nationalID');
  const [nationality, countryFlag] = formData.get('nationality').split('%');

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error('Please provide a valid national ID');

  const updatedData = {
    nationality,
    countryFlag,
    nationalID,
  };

  const { data, error } = await supabase
    .from('guests')
    .update(updatedData)
    .eq('id', session.user.guestId);

  if (error) throw new Error('Guest could not be updated');

  // revalidate after update
  revalidatePath('/account/profile');
}
