import { Image } from "@/libs/core/components/ui/Image";
import banner from "@/libs/tts/assets/candidate-banner.png";
import logo from "@/libs/tts/assets/logo.png";

interface Props {
  children: React.ReactNode;
  title?: string;
}

function AuthLayout({ children, title }: Props) {
  return (
    <section className="w-full">
      <div className="flex justify-center items-center h-screen">
        <div className="relative lg:max-w-[1100px] max-w-[480px] w-full h-auto">
          <div className="h-full grid grid-cols-1 md:grid-cols-[6fr_4fr] items-center">
            <div className="hidden md:block">
              <Image
                src={banner}
                alt="banner"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            <div className="w-full px-4 sm:px-8 flex flex-col gap-6">
              <div className="flex flex-col gap-8 items-center">
                <Image
                  src={logo}
                  alt="logo"
                  className="w-[80px]"
                  loading="eager"
                />

                {title && <h3 className="text-center capitalize">{title}</h3>}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;
