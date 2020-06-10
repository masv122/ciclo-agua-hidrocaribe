const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public"))); //para usar la ruta del proyect

app.post("/mail", async function (req, res) {
  const body = req.body;
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    let info = await transporter.sendMail({
      from: body.usuario.nombre + " " + body.usuario.apellido + "<informe@lunar.com>",
      to: body.email,
      subject: "hello",
      text: "Informe de las Tuberias",
      html: body.informe,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("preview urll: %s", nodemailer.getTestMessageUrl(info));
    res.write(
      JSON.stringify({
        error: false,
      })
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.write(
      JSON.stringify({
        error: true,
      })
    );
    res.end();
  }
});

app.set("puerto", process.env.PORT || 4000); //se establece el puerto de conexion
app.listen(app.get("puerto"), () => {
  //se avisa que se esta escuchando el puerto
  console.log("Servidor Hidro Caribe Iniciado", app.get("puerto"));
});
