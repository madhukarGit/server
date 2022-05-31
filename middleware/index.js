import User from "../modals/user";

export const isInstructor = async (req, res, next) => {
  try {
    console.log("req.user ", req.user);
    const user = await User.findById(req.user._id).exec();
    if (!user.role.includes("Instructor")) {
      res.send(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
