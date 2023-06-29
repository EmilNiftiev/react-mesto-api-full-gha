const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator'); // Установка: npm install validator
const UnauthorizedError = require('../utils/errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина поля "name" - 2'], // Указываем требования и передаем клиенту сообщение об ошибке
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальная длина поля "about" - 2'],
    maxlength: [30, 'Максимальная длина поля "about" - 30'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Некорректный URL',
    }, // https://www.npmjs.com/package/validator
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    select: false, // По умолчанию хеш пароля пользователя не будет возвращаться из базы.
    required: [true, 'Поле "password" должно быть заполнено'],
  },
}, { versionKey: false }); // Убираем отслеживание версии схемы ("__v" в объекте)

// Код проверки логина и пароля делаем частью схемы userSchema.
// Принимает два параментра и возвращает либо объект пользователя, либо ошибку

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password') // т.к. в случае аутентификации хеш пароля нужен
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new UnauthorizedError('Неправильный email или пароль'),
        );
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(
              new UnauthorizedError('Неправильный email или пароль'),
            );
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
