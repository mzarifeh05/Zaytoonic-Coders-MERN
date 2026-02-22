const express = require("express")
const router = express.Router()
const Member = require("../models/member.model")

// GET all members
router.get("/", async (req, res) => {
    console.log("GET /members called")
    const members = await Member.find()
    res.json(members)
})

// POST a new member
router.post("/", async (req, res) => {
    const member = new Member(req.body)
    await member.save()
    res.json(member)
})

// PUT (update) a member by id
router.put("/:id", async (req, res) => {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(member)
})

// DELETE a member by id
router.delete("/:id", async (req, res) => {
    await Member.findByIdAndDelete(req.params.id)
    res.json({ message: "member removed" })
})

module.exports = router