import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import DonationHistory from "../models/DonationHistory.js";

export const getDashboardStats = async (req, res) => {
  try {

    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      activeRequests,
      completedDonations,
      pendingHospitals
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "donor"
      }),

      User.countDocuments({
        role: "hospital"
      }),

      BloodRequest.countDocuments({
        status: {
          $in: ["Open", "Accepted"]
        }
      }),

      DonationHistory.countDocuments(),

      User.countDocuments({
        role: "hospital",
        "hospitalDetails.isVerified": false
      })

    ]);

    res.status(200).json({

      success: true,

      overview: {

        totalUsers,

        totalDonors,

        totalHospitals,

        activeRequests,

        completedDonations,

        pendingHospitals

      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to fetch dashboard statistics."

    });

  }
};

export const getAllUsers = async (req, res) => {
  try {

    const {
      search = "",
      role = "",
      status = ""
    } = req.query;

    const query = {};

    // Search
    if (search) {

      query.$or = [

        {
          name: {
            $regex: search,
            $options: "i"
          }
        },

        {
          email: {
            $regex: search,
            $options: "i"
          }
        },

        {
          phone: {
            $regex: search,
            $options: "i"
          }
        }

      ];

    }



    // Role Filter

    if (role) {

      query.role = role;

    }

    // Status Filter

    if (status === "active") {

      query.isBlocked = false;

    }

    if (status === "blocked") {

      query.isBlocked = true;

    }

    const users = await User.find(query)

      .select(
        "name email phone role location isBlocked isVerified createdAt"
      )

      .sort({
        createdAt: -1
      });

    res.status(200).json({

      success: true,

      count: users.length,

      users

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to fetch users."

    });

  }
};

export const getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch user."
    });

  }
};