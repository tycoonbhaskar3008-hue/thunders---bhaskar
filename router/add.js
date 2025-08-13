const express = require("express");
const router = express.Router();
const dbm = require("../lib/dbmanager");
const thunderboltm = require("../lib/thunderboltmanager");

const requireAuth = (req, res, next) => {
  // if (req.session.userId) {
  //     next(); // User is authenticated, continue to next middleware
  // } else {
  //     res.redirect('/login'); // User is not authenticated, redirect to login page
  // }
  next();
};

router.get("/", requireAuth, async function (req, res) {
  res.render("add", { title: "Team" });
});

// New route for saving members with all fields
router.post("/saveMember", requireAuth, async (req, res) => {
  try {
    const { node, group, irId, name, phone, email, targets } = req.body;
    
    // Validate required fields
    if (!node || !group || !name) {
      return res.json({ success: false, message: "Node, Group, and Name are required" });
    }

    // Save member to database
    const memberData = {
      node,
      group,
      irId: irId || '',
      name,
      phone: phone || '',
      email: email || '',
      targets: targets || {},
      createdAt: new Date()
    };

    await dbm.saveMember(memberData);
    res.json({ success: true, message: "Member added successfully" });
  } catch (error) {
    console.error("Error saving member:", error);
    res.json({ success: false, message: "Error saving member" });
  }
});

// New route for saving activities
router.post("/saveActivity", requireAuth, async (req, res) => {
  try {
    const { memberId, week, year, activities } = req.body;
    
    if (!memberId || !week || !year) {
      return res.json({ success: false, message: "Member ID, Week, and Year are required" });
    }

    const activityData = {
      memberId,
      week: parseInt(week),
      year: parseInt(year),
      activities: activities || {},
      updatedAt: new Date()
    };

    await dbm.saveActivity(activityData);
    res.json({ success: true, message: "Activity updated successfully" });
  } catch (error) {
    console.error("Error saving activity:", error);
    res.json({ success: false, message: "Error saving activity" });
  }
});

// Updated route to get members with node information
router.post("/getMembers", requireAuth, async (req, res) => {
  try {
    const { group } = req.body;
    let members;
    
    if (group === "Sapphire") {
      members = await dbm.getSapphireMembers();
    } else {
      members = await dbm.getSKBMembers();
    }
    
    res.json(members);
  } catch (error) {
    console.error("Error getting members:", error);
    res.json([]);
  }
});

router.post("/addUser", requireAuth, async (req, res) => {
  const name = req.body.name;
  const group = req.body.group;

  await dbm.addUser(name, group);
  res.send("success");
});

router.post("/isValidID", requireAuth, async (req, res) => {
  const id = req.body.id;
  const result = await thunderboltm.getUserDetails(id);
  res.send(result);
});

router.post("/isValidName", requireAuth, async (req, res) => {
  const { name, group } = req.body;
  const result = await dbm.isNameAlreadyExists(name, group);
  res.send(!result);
});

router.post("/getNames", requireAuth, async (req, res) => {
  const docArray = await dbm.getUserNames();
  res.send(docArray);
});

router.post("/getNamesSapphire", requireAuth, async (req, res) => {
  const docArray = await dbm.getUserNamesSapphire();
  res.send(docArray);
});

router.post("/updateNamelist", requireAuth, async (req, res) => {
  const name = req.body.name;
  const link = req.body.link;

  await dbm.updateNamelist(name, link);
  res.redirect("/add");
});

router.post("/delete", requireAuth, async (req, res) => {
  const name = req.body.name;
  const group = req.body.group;

  await dbm.delete(name, group);
});

router.post("/getNLData", requireAuth, async (req, res) => {
  const uid = req.body.uid;
  const nl = await thunderboltm.getData(uid);
  res.send(nl);
});

router.post("/getKIVData", requireAuth, async (req, res) => {
  const uid = req.body.uid;
  const nl = await thunderboltm.getData(uid, 'kiv');
  res.send(nl);
});

module.exports = router;
