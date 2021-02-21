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
      subject: `[React Shop] ${req.body.name} 님, 이메일 인증을 완료해주세요`, // Subject line
      html: `<div style="font-family: 'Apple SD Gothic Neo', 'sans-serif' !important; width: 540px; height: 600px; border-top: 3px solid #1890ff; margin: 100px auto; padding: 30px 0; box-sizing: border-box;">
    
      <h1 style="margin: 0; padding: 0 5px; font-size: 28px; font-weight: 400;">
      <span style="color: #1890ff;">메일인증</span> 안내입니다.
    </h1>
    <p style="font-size: 16px; line-height: 26px; margin-top: 50px; padding: 0 5px;">
      안녕하세요.<strong>${req.body.name}</strong> 님<br />
      REACT_SHOP 에 가입해 주셔서 진심으로 감사드립니다.<br />
      아래 링크를 클릭하여 회원가입을 완료해 주세요.<br />
      감사합니다.
    </p>
    <a href=${authUrl}>인증 링크 바로가기</a>
    <div style="font-family: 'Apple SD Gothic Neo', 'sans-serif' !important; width: 540px; height: 600px; border-top: 2px solid #d9d9d9; margin: 100px auto; padding: 30px 0; box-sizing: border-box;">

    
  </div>`,
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

router.get("/mailauth", async (req, res) => {
  try {
    const findUser = await User.findOne({ where: { userId: req.query.email } });
    await User.update(
      { authToken: req.query.token },
      {
        where: {
          id: findUser.id,
        },
      }
    );
    res.redirect(process.env.registerAuthSuccessUrl);
  } catch (error) {
    return res
      .status(401)
      .send({ loginSuccess: false, message: "존재 하지 않는 유저입니다." }); //디비에서 찾을수 없을 경우
  }
});

router.post("/login", signupAuth, (req, res) => {
  console.log("login 완료");
});

module.exports = router;
