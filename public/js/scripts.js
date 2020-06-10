var app = new Vue({
  el: "#app",
  data: {
    duracion: null,
    dias: null,
    vaciado: 5,
    usuario: {
      nombre: "",
      apellido: "",
    },
    nombre: "",
    apellido: "",
    correo: "",
    sesion: false,
    configuracion: false,
    mantenimiento: 5,
    fechaUltima: null,
    resultadoCompleto: false,
    retraso: false,
    evaluacion: {
      fase: "",
      mantenimiento: "",
    },
    fases: [
      {
        fase: "1",
        mantenimiento: false,
        nivelAgua: "Alto",
      },
      {
        fase: "2",
        mantenimiento: false,
        nivelAgua: "Bajando",
      },
      {
        fase: "3",
        mantenimiento: true,
        nivelAgua: "Sin Agua",
      },
      {
        fase: "4",
        mantenimiento: false,
        nivelAgua: "Sin Agua",
      },
    ],
  },
  methods: {
    evaluar() {
      this.fechaUltima = Number.parseInt(this.fechaUltima);
      this.duracion = Number.parseInt(this.duracion);
      this.dias = Number.parseInt(this.dias);
      if (this.fechaUltima >= 1 && this.fechaUltima <= this.duracion)
        this.evaluacion = this.fases[0];
      else if (
        this.fechaUltima > this.duracion &&
        this.fechaUltima <= this.duracion + this.vaciado
      )
        this.evaluacion = this.fases[1];
      else if (
        this.fechaUltima > this.duracion + this.vaciado &&
        this.fechaUltima <= this.duracion + this.vaciado + this.mantenimiento
      )
        this.evaluacion = this.fases[2];
      else if (
        this.fechaUltima > this.duracion + this.vaciado + this.mantenimiento &&
        this.fechaUltima < this.dias
      )
        this.evaluacion = this.fases[3];
      else {
        this.retraso = true;
        this.evaluacion = this.fases[3];
      }
      axios
        .post("/mail", {
          email: this.correo,
          usuario: this.usuario,
          informe:
            "<ul> <li> Fase del ciclo actual: " +
            this.evaluacion.fase +
            " </li> <li> Mantimiento: " +
            this.evaluacion.mantenimiento
              ? "apta"
              : "no apta" + "</li> <li> Retraso:  " + this.retraso
              ? "si"
              : "no" +
                "</li> <li> Nivel de Agua: " +
                this.evaluacion.nivelAgua +
                "</li> </ul>",
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
      this.resultadoCompleto = true;
    },
    iniciarSesion() {
      this.usuario.nombre = this.nombre;
      this.usuario.apellido = this.apellido;
      localStorage.setItem(
        "controlSesion",
        JSON.stringify({
          usuario: this.usuario,
          correo: this.correo,
        })
      );
      this.configuracion = false;
      this.sesion = true;
    },
  },
  computed: {
    valDuracion() {
      return this.duracion <= 0;
    },
    valDias() {
      return this.dias < 21 || this.dias > 31;
    },
    valFecha() {
      return this.fechaUltima <= 0;
    },
    isDisabled() {
      return this.valDuracion || this.valDias || this.valFecha;
    },
    isCompleted() {
      return this.nombre != "" && this.apellido != "" && this.correo != "";
    },
  },
  created: function () {
    let datos = JSON.parse(localStorage.getItem("controlSesion"));
    if (datos == null) {
      this.sesion = false;
    } else {
      this.sesion = true;
      this.usuario = datos.usuario;
      this.correo = datos.correo;
    }
  },
});
