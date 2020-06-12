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
    enviando: false,
    errorEnvio: false,
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
    async evaluar() {
      const diferencia = this.dateDiff(
        this.parseDate(this.fechaUltima),
        this.parseDate(this.fechaActual)
      );
      this.duracion = Number.parseInt(this.duracion);
      this.dias = Number.parseInt(this.dias);
      if (diferencia >= 1 && diferencia <= this.duracion)
        this.evaluacion = this.fases[0];
      else if (
        diferencia > this.duracion &&
        diferencia <= this.duracion + this.vaciado
      )
        this.evaluacion = this.fases[1];
      else if (
        diferencia > this.duracion + this.vaciado &&
        diferencia <= this.duracion + this.vaciado + this.mantenimiento
      )
        this.evaluacion = this.fases[2];
      else if (
        diferencia > this.duracion + this.vaciado + this.mantenimiento &&
        diferencia < this.dias
      )
        this.evaluacion = this.fases[3];
      else {
        this.retraso = true;
        this.evaluacion = this.fases[3];
      }
      this.enviando = true;
      this.errorEnvio = false;
      const respuesta = await axios.post("/mail", {
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
      });
      if (respuesta.data.error) this.errorEnvio = true;
      else this.enviando = false;
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
    addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    },
    parseDate(str) {
      let mdy = str.split("-");
      return new Date(mdy[0], mdy[0] - 1, mdy[2]);
    },
    dateDiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
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
      if (this.fechaUltima === null) return true;
      else
        return (
          this.dateDiff(
            this.parseDate(this.fechaUltima),
            this.parseDate(this.fechaActual)
          ) <= 0
        );
    },
    isDisabled() {
      return this.valDuracion || this.valDias || this.valFecha;
    },
    isCompleted() {
      return this.nombre != "" && this.apellido != "" && this.correo != "";
    },
    fechaActual() {
      let hoy = new Date();
      let dd = this.addZero(hoy.getDate());
      let mm = this.addZero(hoy.getMonth() + 1);
      let yyyy = hoy.getFullYear();
      return yyyy + "-" + mm + "-" + dd;
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
