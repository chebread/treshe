import googleAuth from 'components/googleAuth';

const Auth = () => {
  const onClickLogin = async () => {
    await googleAuth();
  };
  return (
    <div>
      <button onClick={onClickLogin}>Login & Sign up with Google</button>
    </div>
  );
};

export default Auth;
