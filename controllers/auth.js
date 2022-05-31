import User from "../modals/user";
import { comparePassword, hashPassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import user from "../modals/user";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const ses = new AWS.SES(awsConfig);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let userExist = await User.findOne({ email }).exec();
    if (userExist) res.status(400).send("Email is taken");

    //hash password
    const hashedPassword = await hashPassword(password);

    //register
    const user = new User({ name, email, password: hashedPassword }).save();
    console.log(user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let userFound = await User.findOne({ email }).exec();
    if (!userFound) res.status(400).send("No User Found");

    console.log("user password ", userFound);
    //hash password
    const match = await comparePassword(password, userFound.password);
    if (!match) {
      return res.status(400).send("wrong password");
    }
    //create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    userFound.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json(userFound);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error! try again");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json("sign out succesful");
  } catch (err) {
    console.log(err);
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await user.findById(req.user._id).select("_password").exec();
    console.log("current user ", user);
    return res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: ["hmk02330@gmail.com"],
      },
      ReplyToAddresses: [process.env.EMAIL_FROM],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html><h1>Reset Password Link</h1><p>Please use the following link to reset the password !</></html>`,
          },
        },
        Subject: { Charset: "UTF-8", Data: "Password reset link" },
      },
    };
    const emailSent = ses.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => console.log(err));
  } catch (err) {}
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email is ", email);
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) {
      res.json("User not found");
    }
    //send an email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [process.env.EMAIL_FROM],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html><h1>Reset Password Link</h1><p>Use this code to reset the password !</h1>
              <h2 style="color:red">${shortCode}</h2>
            </html>`,
          },
        },
        Subject: { Charset: "UTF-8", Data: "Password reset " },
      },
    };
    const emailSent = ses.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const hashedPassword = await hashPassword(newPassword);
    const user = User.findOneAndUpdate(
      { email, passwordResetCode: code },
      { password: hashedPassword, passwordResetCode: "" }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
