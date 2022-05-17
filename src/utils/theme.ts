const html = document.documentElement

const configLight = (): void => {
  html.classList.remove('dark')
}
const configDark = (): void => {
  html.classList.add('dark')
}
const configAuto = (): void => {
  const currentHour = new Date().getHours()
  if (currentHour < 8 || currentHour > 20) {
    configDark()
  } else {
    configLight()
  }
}

export const handleThemeChange = (theme: number): void => {
  if (theme === 1) {
    configLight()
  } else if (theme === 2) {
    configDark()
  } else {
    configAuto()
  }
}
