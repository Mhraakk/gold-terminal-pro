import { Link } from "@tanstack/react-router";
import {
  BsiBody,
  BsiDisplay,
  BsiFolio,
  BsiIndex,
  BsiIndexGroup,
  BsiIndexItem,
  BsiPage,
  BsiShell,
  BsiSpread,
  BsiWell,
} from "@/components/book-serif-index";

export function AppNotFound() {
  return (
    <BsiShell>
      <BsiIndex>
        <BsiIndexGroup>بایگانی</BsiIndexGroup>
        <BsiIndexItem active>۴۰۴</BsiIndexItem>
      </BsiIndex>
      <BsiWell>
        <BsiSpread>
          <BsiPage>
            <BsiFolio>f. 404</BsiFolio>
            <p className="bsi-kicker">ZARIN · MISS</p>
            <BsiDisplay>برگ نیست</BsiDisplay>
            <BsiBody drop="ا">
              این میز در آتلیه نیست. آدرس اشتباه است یا برگ برداشته شده.
            </BsiBody>
            <Link
              to="/"
              search={{ desk: "board" }}
              className="mt-8 inline-flex min-h-11 items-center justify-center bg-[var(--bsi-accent)] px-4 text-sm font-semibold text-[#f6f0e2] shadow-beautiful-sm hover:shadow-beautiful-md"
            >
              بازگشت به دفتر
            </Link>
          </BsiPage>
        </BsiSpread>
      </BsiWell>
    </BsiShell>
  );
}
