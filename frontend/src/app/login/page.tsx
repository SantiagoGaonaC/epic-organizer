"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  ButtonGroup,
  Center,
  Link,
  useToast,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useForm } from "react-hook-form";
import axios from "axios";
import { env } from "@/env";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { error } from "console";
import { useState } from "react";
import { CheckIcon } from "@chakra-ui/icons";
import { Login, LoginSchema } from "../../../schemas/AuthSchema";
import useAuth from "../../../hooks/useAuth";

const Login: NextPage = () => {
  const white = useColorModeValue("white", "white");
  const [noActiveUser, setNoActiveUser] = useState(false);
  const [emailCodeIncorrect, setEmailCodeIncorrect] = useState(false);
  const [errLogin, setErrLogin] = useState(false);
  const toast = useToast();
  const { setUser } = useAuth();

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({ resolver: zodResolver(LoginSchema) });

  const resetStates = () => {
    setNoActiveUser(false);
    setEmailCodeIncorrect(false);
    setErrLogin(false);
  };

  const onSubmit = async () => {
    const { email, code } = getValues();
    console.log({ email, code });
    resetStates();

    try {
      const response = await axios.post(
        `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login/${email}`,
        { code },
        { withCredentials: true }
      );

      if (response.data.ok) {
        const tokenPayload = response.data.data;
        localStorage.setItem("user", JSON.stringify(tokenPayload));
        setUser(tokenPayload);
        router.push("/calendar");
      } else {
        console.log("Error: Error en el inicio de sesión");
        setErrLogin(true);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 403:
              console.log("Usuario no activado");
              setNoActiveUser(true);
              break;
            case 404:
              console.log("Email o código incorrecto");
              setEmailCodeIncorrect(true);
              break;
            default:
              console.log("Error: " + error);
              setErrLogin(true);
          }
        } else {
          console.log("Error: " + error);
          setErrLogin(true);
        }
      } else {
        console.log("Error: " + error);
        setErrLogin(true);
      }
    }
  };

  const onError = () => {
    resetStates();
    console.log({ errors });
  };

  const router = useRouter();

  const errorMessages = [
    { condition: noActiveUser, message: "Usuario no activo" },
    { condition: emailCodeIncorrect, message: "Email o código incorrecto" },
    { condition: errLogin, message: "Error en el inicio de sesión" },
  ];

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.900", "gray.200")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} color={white}>
            Inicio de sesión
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            organiza tus tareas! ✌️
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("gray.800", "gray.200")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4} color={white}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="text"
                  placeholder="Ingresa tu email"
                  {...register("email")}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl marginTop={3} id="code" isInvalid={!!errors.code}>
                <FormLabel>Código</FormLabel>
                <Input
                  type="number"
                  placeholder="Ingresa tu código"
                  {...register("code")}
                />
                <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
              </FormControl>
              <ButtonGroup marginTop={8} justifyContent="center">
                <Button
                  type="submit"
                  color={white}
                  rounded={"full"}
                  _hover={{
                    bg: "gray.700",
                  }}
                  onClick={() => {
                    // const {email, code} = getValues();
                    // axios.post(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login/${email}`,
                    // { code }
                    // )
                    // .then(({ data }) => {
                    //   router.push('/calendar');
                    // })
                    // .catch((error) => console.log(error));
                  }}
                >
                  Iniciar sesión
                </Button>{" "}
                <Button
                  color={white}
                  rounded={"full"}
                  _hover={{
                    bg: "gray.700",
                  }}
                  type="submit"
                  onClick={() => {
                    const email = getValues("email");
                    axios
                      .post(
                        `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login/${email}/code`
                      )
                      .then(({ data }) => {
                        toast({
                          description: data.message,
                          status: "success",
                          icon: <CheckIcon />,
                          position: "top",
                        });
                      })
                      .catch(console.log);
                  }}
                >
                  Quiero un código
                </Button>
              </ButtonGroup>
              {errorMessages.map(
                ({ condition, message }) =>
                  condition && (
                    <Center key={message}>
                      <Text color="red" fontSize="sm" mt={2}>
                        {message}
                      </Text>
                    </Center>
                  )
              )}
              <Center>
                <Link
                  color={"blue.400"}
                  marginTop={2}
                  fontSize="xs"
                  onClick={() => router.push("/register")}
                >
                  Registrarse
                </Link>
              </Center>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
