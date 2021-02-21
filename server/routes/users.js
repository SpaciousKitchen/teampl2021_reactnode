const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const { signupAuth } = require("../middleware/err");
const dotenv = require("dotenv");
dotenv.config();

//=================================
//             User
//=================================

router.post("/register", async (req, res, next) => {
  console.log(req.body);

  const findUser = await User.findOne({ where: { userId: req.body.email } });
  console.log(findUser);

  if (findUser) {
    return res
      .status(401)
      .send({ signupSuccess: false, message: "이미 존재하는 아이디입니다." });
  } else {
    const passwordHash = bcrypt.hashSync(req.body.password, 8);

    await User.create({
      userId: req.body.email,
      password: passwordHash,
      name: req.body.name,
      authToken: false,
    });

    let transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const authUrl =
      process.env.registerSuccessUrl +
      req.body.email +
      "&" +
      "token=" +
      process.env.emailToken;

    let message = {
      from: `React Shop <${process.env.MAIL_USER}>`, // sender address
      to: req.body.email, // list of receivers
      subject: "안녕하세요. 이메일 인증을 완료해주세요", // Subject line
      html: `<p>안녕하세요.
    React Shop 에서 가입하신 이메일 계정 확인을 위한 인증 메일입니다.
    아래 버튼을 클릭하여 계정 인증을 완료해 주세요.</p>
    <a href=${authUrl}>인증 링크 바로가기</a>`, // html body
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
      }
    });

    return res.status(201).send({ signupSuccess: true });
  }
});

router.post("/login", signupAuth, (req, res) => {});

module.exports = router;
