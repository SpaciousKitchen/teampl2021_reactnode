const { User } = require("../models");
exports.signupAuth = async (req, res, next) => {
  try {
    const findUser = await User.findOne({ where: { userId: req.body.email } });
    if (findUser.authToken == "0") {
      //메인 인증을 하지 않았을 경우
      return res
        .status(403)
        .send({ loginSuccess: false, message: "인증 메일을 확인하세요" });
    } else {
      next();
    }
  } catch (error) {
    return res
      .status(401)
      .send({ loginSuccess: false, message: "존재 하지 않는 유저입니다." }); //디비에서 찾을수 없을 경우
  }
};
