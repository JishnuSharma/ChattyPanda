import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signUp = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    try {
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be 6 charaters long",
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            return res.status(
                400,
                json({
                    message: "Invalid user data",
                })
            );
        }
    } catch (error) {
        console.log("Error occured", error.message);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "All fields are required",
        });
    }

    try {
        const user = await User.findOne({
            email,
        });

        if (!user) {
            return res.status(400).send({
                message: "Invalid credentials",
            });
        } else {
            const isPassword = await bcrypt.compare(password, user.password);

            if (!isPassword) {
                return res.json({
                    message: "Invalid credentials",
                });
            }

            generateToken(user._id, res);

            res.status(200).json({
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            });
        }
    } catch (error) {
        console.log("Error in login controller: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        return res.status(500).json({
            message: "Internal Server Errro",
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                message: "Profile picture is required",
            });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in profile update controller", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const checkAuth = (req,res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkauth controller", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}