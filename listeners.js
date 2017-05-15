import { UserModel } from './models.js';

export async function ADD_USER(action) {

  const user = action.user;
  const newUser = new UserModel(user);
  try {
    await newUser.save();
    // TODO emit action across pub/sub channel to update list for all users.
  } catch (e) {
    throw e;
  }
  return action;
}

export async function FETCH_USERS(action) {
  await UserModel.find((err, allUsers) => {
    if (err) {
      throw err;
    }
    action.users = allUsers;
  });
  return action;
}
