import express from 'express';
const router = express.Router();

// GET /api/centers
router.get('/', (req, res) => {
  const centersData = [
    {
      name: "Zonal Hospital Blood Bank",
      loc: "Mandi, Himachal Pradesh",
      phone: "+91 1905 222111",
      distance: "1.2",
      waitTime: 10,
      isBusy: false,
      aiRecommended: true
    },
    {
      name: "Red Cross Society",
      loc: "Near District Court, Mandi",
      phone: "+91 1905 223456",
      distance: "3.5",
      waitTime: 45,
      isBusy: true,
      aiRecommended: false
    }
  ];

  res.status(200).json(centersData);
});

export default router;